import { Test, TestingModule } from '@nestjs/testing'
import { PurchasesService } from './purchases.service'
import { PrismaService } from '../../database/prisma.service'
import { NotFoundException, BadRequestException } from '@nestjs/common'
import { CreatePurchaseDto } from './dto/create-purchase.dto'
import { PurchasesRepository } from './purchases.repository'
import { PacksRepository } from '../packs/packs.repository'
import { RafflesRepository } from '../raffles/raffles.repository'

describe('PurchasesService', () => {
  let service: PurchasesService

  const mockPurchasesRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByUser: jest.fn(),
    updateStatus: jest.fn(),
    createFullPurchase: jest.fn(),
    findUnique: jest.fn(),
  }

  const mockPacksRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  }

  const mockRafflesRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
  }

  const mockPrisma = {
    $transaction: jest.fn((fn) => fn(mockPrisma)),
    $queryRaw: jest.fn(),
    raffle: {
      findUnique: jest.fn(),
    },
    pack: {
      findUnique: jest.fn(),
    },
    purchase: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn().mockResolvedValue({
        id: 'purchase-1',
        status: 'paid',
        createdAt: new Date(),
        totalAmount: { toNumber: () => 2990 },
        raffleId: 'raffle-1',
        raffle: { title: 'Test Raffle' },
      }),
    },
    userPack: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    paymentTransaction: {
      create: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
    },
    luckyPass: {
      createMany: jest.fn(),
      findMany: jest.fn(),
    },
    raffleProgress: {
      upsert: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: PurchasesRepository, useValue: mockPurchasesRepository },
        { provide: PacksRepository, useValue: mockPacksRepository },
        { provide: RafflesRepository, useValue: mockRafflesRepository },
      ],
    }).compile()

    service = module.get<PurchasesService>(PurchasesService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create purchase with valid data', async () => {
      const userId = 'user-1'
      const createDto: CreatePurchaseDto = {
        raffleId: 'raffle-1',
        packId: 'pack-1',
        quantity: 2,
      }

      mockRafflesRepository.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'active',
        title: 'Test Raffle',
        unitPrice: 2990,
      })

      mockPacksRepository.findUnique.mockResolvedValue({
        id: 'pack-1',
        ticketCount: 1,
        price: { toNumber: () => 2990 },
      })

      mockPurchasesRepository.createFullPurchase.mockResolvedValue({
        purchase: {
          id: 'purchase-1',
          userId,
          raffleId: createDto.raffleId,
          totalAmount: 5980,
          status: 'pending',
          createdAt: new Date(),
        },
        userPack: { id: 'user-pack-1' },
        paymentTransaction: { id: 'pt-1' },
      })

      const result = await service.create(userId, createDto)

      expect(result).toHaveProperty('id')
      expect(result.raffleId).toBe(createDto.raffleId)
      expect(result.totalAmount).toBe(5980)
      expect(result.status).toBe('pending')
    })

    it('should throw if raffle not found', async () => {
      mockRafflesRepository.findUnique.mockResolvedValue(null)

      await expect(
        service.create('user-1', {
          raffleId: 'invalid',
          packId: 'pack-1',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw if raffle not active', async () => {
      mockRafflesRepository.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'closed',
      })

      await expect(
        service.create('user-1', {
          raffleId: 'raffle-1',
          packId: 'pack-1',
          quantity: 1,
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw if pack not found', async () => {
      mockRafflesRepository.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'active',
      })

      mockPacksRepository.findUnique.mockResolvedValue(null)

      await expect(
        service.create('user-1', {
          raffleId: 'raffle-1',
          packId: 'invalid',
          quantity: 1,
        }),
      ).rejects.toThrow(NotFoundException)
    })

    it('should throw if quantity is less than 1', async () => {
      await expect(
        service.create('user-1', {
          raffleId: 'raffle-1',
          packId: 'pack-1',
          quantity: 0,
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw if pack has no price', async () => {
      mockRafflesRepository.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'active',
      })

      mockPacksRepository.findUnique.mockResolvedValue({
        id: 'pack-1',
        ticketCount: 1,
        price: null,
      })

      await expect(
        service.create('user-1', {
          raffleId: 'raffle-1',
          packId: 'pack-1',
          quantity: 1,
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw if raffleId is empty', async () => {
      await expect(
        service.create('user-1', {
          raffleId: '',
          packId: 'pack-1',
          quantity: 1,
        }),
      ).rejects.toThrow(BadRequestException)
    })

    it('should throw if packId is empty', async () => {
      mockRafflesRepository.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'active',
      })

      await expect(
        service.create('user-1', {
          raffleId: 'raffle-1',
          packId: '',
          quantity: 1,
        }),
      ).rejects.toThrow(BadRequestException)
    })
  })

  describe('confirmPayment', () => {
    it('should confirm payment and update status', async () => {
      const purchaseId = 'purchase-1'

      mockPurchasesRepository.findUnique
        .mockResolvedValueOnce({
          id: purchaseId,
          status: 'pending',
          userId: 'user-1',
          raffleId: 'raffle-1',
          createdAt: new Date(),
          totalAmount: { toNumber: () => 2990 },
          raffle: { title: 'Test Raffle' },
          userPacks: [{ id: 'up-1', quantity: 1, pack: { ticketCount: 1, luckyPassQuantity: 1 } }],
        })
        .mockResolvedValueOnce({
          id: purchaseId,
          status: 'paid',
          userId: 'user-1',
          raffleId: 'raffle-1',
          createdAt: new Date(),
          totalAmount: { toNumber: () => 2990 },
          raffle: { title: 'Test Raffle' },
          userPacks: [{ id: 'up-1', quantity: 1, pack: { ticketCount: 1, luckyPassQuantity: 1 } }],
        })

      mockPrisma.purchase.update.mockResolvedValue({ id: purchaseId, status: 'paid' })
      mockPrisma.paymentTransaction.updateMany.mockResolvedValue({ count: 1 })

      mockPrisma.userPack.findMany.mockResolvedValue([
        { id: 'up-1', quantity: 1, selectedNumbers: null, pack: { luckyPassQuantity: 1 } },
      ])

      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ id: 'raffle-1' }]) // FOR UPDATE lock
        .mockResolvedValueOnce([{ max_ticket: '0' }]) // MAX ticket query

      mockPrisma.luckyPass.createMany.mockResolvedValue({ count: 1 })

      mockPrisma.raffle.findUnique.mockResolvedValue({
        id: 'raffle-1',
        goalPacks: 100,
      })

      mockPrisma.raffleProgress.upsert.mockResolvedValue({
        raffleId: 'raffle-1',
        packsSold: 1,
      })
      mockPrisma.raffleProgress.findUnique.mockResolvedValue({
        raffleId: 'raffle-1',
        packsSold: 1,
      })
      mockPrisma.raffleProgress.update.mockResolvedValue({})

      // milestone.updateMany for auto-unlock
      const mockMilestoneUpdateMany = jest.fn().mockResolvedValue({ count: 0 })
      mockPrisma['milestone'] = { updateMany: mockMilestoneUpdateMany }

      const result = await service.confirmPayment(purchaseId, {
        providerTransactionId: 'flow-123',
        provider: 'flow',
        status: 'approved',
      })

      expect(result.status).toBe('paid')
    })

    it('should return existing purchase if already paid (idempotent)', async () => {
      const purchaseId = 'purchase-1'

      mockPurchasesRepository.findUnique.mockResolvedValue({
        id: purchaseId,
        status: 'paid',
        userId: 'user-1',
        raffleId: 'raffle-1',
        createdAt: new Date(),
        totalAmount: { toNumber: () => 2990 },
        raffle: { title: 'Test Raffle' },
      })

      const result = await service.confirmPayment(purchaseId, {
        providerTransactionId: 'flow-123',
        provider: 'flow',
        status: 'approved',
      })

      expect(result.status).toBe('paid')
      // $transaction should NOT have been called since purchase already paid
      expect(mockPrisma.$transaction).not.toHaveBeenCalled()
    })

    it('should throw if purchase not found', async () => {
      mockPurchasesRepository.findUnique.mockResolvedValue(null)

      await expect(
        service.confirmPayment('invalid-id', {
          providerTransactionId: 'flow-123',
          provider: 'flow',
          status: 'approved',
        }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('findByUser', () => {
    it('should return user purchases', async () => {
      const userId = 'user-1'

      mockPurchasesRepository.findByUser.mockResolvedValue([
        {
          id: 'purchase-1',
          userId,
          raffleId: 'raffle-1',
          status: 'paid',
          totalAmount: { toNumber: () => 2990 },
          raffle: { title: 'Test Raffle' },
          createdAt: new Date(),
          userPacks: [{ pack: { ticketCount: 1 } }],
        },
      ])

      const result = await service.findByUser(userId)

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(1)
      expect(result[0].status).toBe('paid')
    })

    it('should return empty array if user has no purchases', async () => {
      mockPurchasesRepository.findByUser.mockResolvedValue([])

      const result = await service.findByUser('user-no-purchases')

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })
  })

  describe('findById', () => {
    it('should return purchase by ID', async () => {
      mockPurchasesRepository.findUnique.mockResolvedValue({
        id: 'purchase-1',
        userId: 'user-1',
        raffleId: 'raffle-1',
        status: 'paid',
        totalAmount: { toNumber: () => 2990 },
        raffle: { title: 'Test Raffle' },
        createdAt: new Date(),
      })

      const result = await service.findById('purchase-1')

      expect(result).toHaveProperty('id')
      expect(result.status).toBe('paid')
    })

    it('should throw if purchase not found', async () => {
      mockPurchasesRepository.findUnique.mockResolvedValue(null)

      await expect(service.findById('invalid')).rejects.toThrow(NotFoundException)
    })
  })

  describe('findByProviderTransactionId', () => {
    it('should find purchase by provider transaction id', async () => {
      mockPrisma.paymentTransaction.findFirst.mockResolvedValue({
        id: 'tx-1',
        providerTransactionId: 'flow-token-123',
        purchase: {
          id: 'purchase-1',
        },
      })

      const result = await service.findByProviderTransactionId('flow-token-123')

      expect(mockPrisma.paymentTransaction.findFirst).toHaveBeenCalledWith({
        where: { providerTransactionId: 'flow-token-123' },
        include: { purchase: true },
      })
      expect(result).toHaveProperty('id', 'purchase-1')
    })

    it('should return null if transaction not found', async () => {
      mockPrisma.paymentTransaction.findFirst.mockResolvedValue(null)

      const result = await service.findByProviderTransactionId('invalid-token')

      expect(result).toBeNull()
    })
  })
})
