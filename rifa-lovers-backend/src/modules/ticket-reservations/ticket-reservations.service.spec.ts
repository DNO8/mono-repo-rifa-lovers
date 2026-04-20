import { Test, TestingModule } from '@nestjs/testing'
import { ConflictException } from '@nestjs/common'
import { TicketReservationsService } from './ticket-reservations.service'
import { TicketReservationsRepository } from './ticket-reservations.repository'
import { PrismaService } from '../../database/prisma.service'

const mockReservationsRepository = {
  findActiveByPurchase: jest.fn(),
  findActiveByUser: jest.fn(),
  findByPurchase: jest.fn(),
  deleteByPurchase: jest.fn(),
  deleteExpired: jest.fn(),
}

const mockTx = {
  $executeRaw: jest.fn(),
  $queryRaw: jest.fn(),
}

const mockPrismaService = {
  $transaction: jest.fn(),
  $queryRaw: jest.fn(),
}

describe('TicketReservationsService', () => {
  let service: TicketReservationsService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TicketReservationsService,
        { provide: TicketReservationsRepository, useValue: mockReservationsRepository },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile()

    service = module.get<TicketReservationsService>(TicketReservationsService)
    jest.clearAllMocks()
  })

  describe('reserve', () => {
    it('should reserve tickets successfully when numbers are free', async () => {
      const reservedRows = [
        {
          id: 'res-1',
          raffle_id: 'raffle-1',
          ticket_number: 42,
          user_id: 'user-1',
          purchase_id: 'purchase-1',
          expires_at: new Date(Date.now() + 15 * 60 * 1000),
          created_at: new Date(),
        },
      ]

      mockPrismaService.$transaction.mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
        mockTx.$executeRaw.mockResolvedValue(1)
        mockTx.$queryRaw
          .mockResolvedValueOnce([]) // takenPasses
          .mockResolvedValueOnce([]) // takenReservations
          .mockResolvedValueOnce(reservedRows) // final select
        return fn(mockTx)
      })

      const result = await service.reserve('user-1', 'raffle-1', [42], 'purchase-1')

      expect(result).toHaveLength(1)
      expect(result[0].ticketNumber).toBe(42)
      expect(result[0].purchaseId).toBe('purchase-1')
      expect(typeof result[0].expiresAt).toBe('string')
    })

    it('should throw ConflictException when ticket is already in lucky_passes', async () => {
      mockPrismaService.$transaction.mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
        mockTx.$executeRaw.mockResolvedValue(1)
        mockTx.$queryRaw
          .mockResolvedValueOnce([{ ticket_number: 42 }]) // takenPasses — taken!
          .mockResolvedValueOnce([]) // takenReservations
        return fn(mockTx)
      })

      await expect(
        service.reserve('user-1', 'raffle-1', [42], 'purchase-1'),
      ).rejects.toThrow(ConflictException)
    })

    it('should throw ConflictException when ticket is reserved by another user', async () => {
      mockPrismaService.$transaction.mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
        mockTx.$executeRaw.mockResolvedValue(1)
        mockTx.$queryRaw
          .mockResolvedValueOnce([]) // takenPasses
          .mockResolvedValueOnce([{ ticket_number: 42 }]) // takenReservations — reserved by other!
        return fn(mockTx)
      })

      await expect(
        service.reserve('user-1', 'raffle-1', [42], 'purchase-1'),
      ).rejects.toThrow(ConflictException)
    })

    it('should list all taken numbers in the ConflictException message', async () => {
      mockPrismaService.$transaction.mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => {
        mockTx.$executeRaw.mockResolvedValue(1)
        mockTx.$queryRaw
          .mockResolvedValueOnce([{ ticket_number: 10 }]) // takenPasses
          .mockResolvedValueOnce([{ ticket_number: 20 }]) // takenReservations
        return fn(mockTx)
      })

      await expect(
        service.reserve('user-1', 'raffle-1', [10, 20, 30], 'purchase-1'),
      ).rejects.toThrow(/10/)
    })
  })

  describe('release', () => {
    it('should call deleteByPurchase', async () => {
      mockReservationsRepository.deleteByPurchase.mockResolvedValue(undefined)
      await service.release('purchase-1')
      expect(mockReservationsRepository.deleteByPurchase).toHaveBeenCalledWith('purchase-1')
    })
  })

  describe('getActiveReservationsForPurchase', () => {
    it('should return mapped active reservations', async () => {
      const now = new Date()
      mockReservationsRepository.findActiveByPurchase.mockResolvedValue([
        {
          id: 'res-1',
          raffleId: 'raffle-1',
          ticketNumber: 99,
          userId: 'user-1',
          purchaseId: 'purchase-1',
          expiresAt: new Date(now.getTime() + 10 * 60 * 1000),
          createdAt: now,
        },
      ])

      const result = await service.getActiveReservationsForPurchase('purchase-1')

      expect(result).toHaveLength(1)
      expect(result[0].ticketNumber).toBe(99)
      expect(result[0].purchaseId).toBe('purchase-1')
    })

    it('should return empty array when no active reservations', async () => {
      mockReservationsRepository.findActiveByPurchase.mockResolvedValue([])
      const result = await service.getActiveReservationsForPurchase('purchase-1')
      expect(result).toEqual([])
    })
  })

  describe('convertToLuckyPasses', () => {
    it('should return ticket numbers from reservations and delete them', async () => {
      mockReservationsRepository.findByPurchase.mockResolvedValue([
        { id: 'r1', raffleId: 'rf', ticketNumber: 42, userId: 'u1', purchaseId: 'p1', expiresAt: new Date(), createdAt: new Date() },
        { id: 'r2', raffleId: 'rf', ticketNumber: 43, userId: 'u1', purchaseId: 'p1', expiresAt: new Date(), createdAt: new Date() },
      ])
      mockReservationsRepository.deleteByPurchase.mockResolvedValue(undefined)

      const result = await service.convertToLuckyPasses('p1', 'u1', 'up1', 'rf', mockTx as never)

      expect(result).toEqual([{ ticketNumber: 42 }, { ticketNumber: 43 }])
      expect(mockReservationsRepository.deleteByPurchase).toHaveBeenCalledWith('p1', mockTx)
    })

    it('should return empty array if no reservations', async () => {
      mockReservationsRepository.findByPurchase.mockResolvedValue([])

      const result = await service.convertToLuckyPasses('p1', 'u1', 'up1', 'rf', mockTx as never)

      expect(result).toEqual([])
      expect(mockReservationsRepository.deleteByPurchase).not.toHaveBeenCalled()
    })
  })

  describe('isTicketReservedOrTaken', () => {
    it('should return false when count is 0', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ count: '0' }])
      const result = await service.isTicketReservedOrTaken('raffle-1', 42)
      expect(result).toBe(false)
    })

    it('should return true when count > 0', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ count: '1' }])
      const result = await service.isTicketReservedOrTaken('raffle-1', 42)
      expect(result).toBe(true)
    })

    it('should exclude purchase when excludePurchaseId is provided', async () => {
      mockPrismaService.$queryRaw.mockResolvedValue([{ count: '0' }])
      const result = await service.isTicketReservedOrTaken('raffle-1', 42, 'purchase-1')
      expect(result).toBe(false)
      expect(mockPrismaService.$queryRaw).toHaveBeenCalledTimes(1)
    })
  })
})
