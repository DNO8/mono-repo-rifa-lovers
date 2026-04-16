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
  let prisma: PrismaService

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
    prisma = module.get<PrismaService>(PrismaService)
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
  })

  describe('confirmPayment', () => {
    it('should confirm payment and update status', async () => {
      const purchaseId = 'purchase-1'

      mockPurchasesRepository.findUnique
        .mockResolvedValueOnce({
          id: purchaseId,
          status: 'pending',
          raffleId: 'raffle-1',
          createdAt: new Date(),
          totalAmount: { toNumber: () => 2990 },
          raffle: { title: 'Test Raffle' },
          userPacks: [{ pack: { ticketCount: 1 } }],
        })
        .mockResolvedValueOnce({
          id: purchaseId,
          status: 'paid',
          raffleId: 'raffle-1',
          createdAt: new Date(),
          totalAmount: { toNumber: () => 2990 },
          raffle: { title: 'Test Raffle' },
          userPacks: [{ pack: { ticketCount: 1 } }],
        })

      mockPurchasesRepository.updateStatus.mockResolvedValue({
        id: purchaseId,
        status: 'paid',
        paidAt: new Date(),
        createdAt: new Date(),
        totalAmount: { toNumber: () => 2990 },
        raffleId: 'raffle-1',
        raffle: { title: 'Test Raffle' },
      })

      mockPrisma.userPack.findMany.mockResolvedValue([
        { id: 'up-1', pack: { ticketCount: 1 } },
      ])

      mockPrisma.paymentTransaction.updateMany.mockResolvedValue({ count: 1 })

      mockPrisma.$queryRaw
        .mockResolvedValueOnce([{ id: 'raffle-1' }]) // FOR UPDATE lock
        .mockResolvedValueOnce([{ max_ticket: '0' }]) // MAX ticket query

      mockPrisma.luckyPass.createMany.mockResolvedValue({ count: 1 })

      mockPrisma.raffleProgress.upsert.mockResolvedValue({
        raffleId: 'raffle-1',
        packsSold: 1,
        ticketsIssued: 1,
      })

      const result = await service.confirmPayment(purchaseId, {
        providerTransactionId: 'flow-123',
        provider: 'flow',
        status: 'approved',
      })

      expect(result.status).toBe('paid')
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
  })
})
