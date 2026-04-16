import { Test, TestingModule } from '@nestjs/testing'
import { LuckyPassesService } from './lucky-passes.service'
import { PrismaService } from '../../database/prisma.service'

describe('LuckyPassesService', () => {
  let service: LuckyPassesService
  let prisma: PrismaService

  const mockPrisma = {
    luckyPass: {
      findMany: jest.fn(),
      count: jest.fn(),
      createMany: jest.fn(),
      update: jest.fn(),
    },
    purchase: {
      findUnique: jest.fn(),
    },
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LuckyPassesService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<LuckyPassesService>(LuckyPassesService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getUserPasses', () => {
    it('should return user lucky passes', async () => {
      const userId = 'user-1'
      const mockPasses = [
        {
          id: 'pass-1',
          userId,
          raffleId: 'raffle-1',
          ticketNumber: 1234,
          status: 'active',
          purchaseId: 'purchase-1',
          createdAt: new Date(),
          raffle: { title: 'Test Raffle' },
        },
      ]

      mockPrisma.luckyPass.findMany.mockResolvedValue(mockPasses)

      const result = await service.getUserPasses(userId)

      expect(result).toHaveLength(1)
      expect(result[0].ticketNumber).toBe(1234)
      expect(result[0].status).toBe('active')
    })
  })

  describe('generatePassesFromPurchase', () => {
    it('should generate lucky passes from confirmed purchase', async () => {
      const purchaseId = 'purchase-1'
      
      mockPrisma.purchase.findUnique.mockResolvedValue({
        id: purchaseId,
        userId: 'user-1',
        raffleId: 'raffle-1',
        status: 'paid',
        userPacks: [
          { pack: { ticketCount: 2 } },
        ],
      })

      mockPrisma.luckyPass.createMany.mockResolvedValue({ count: 2 })

      const result = await service.generatePassesFromPurchase(purchaseId)

      expect(result).toHaveLength(2)
      expect(result[0]).toHaveProperty('ticketNumber')
      expect(result[0]).toHaveProperty('passNumber')
    })

    it('should throw if purchase not paid', async () => {
      const purchaseId = 'purchase-1'
      
      mockPrisma.purchase.findUnique.mockResolvedValue({
        id: purchaseId,
        status: 'pending',
      })

      await expect(service.generatePassesFromPurchase(purchaseId))
        .rejects.toThrow('Purchase must be paid')
    })
  })

  describe('markAsWinner', () => {
    it('should mark pass as winner', async () => {
      const passId = 'pass-1'
      const prizeId = 'prize-1'

      mockPrisma.luckyPass.update.mockResolvedValue({
        id: passId,
        status: 'winner',
        prizeId,
      })

      const result = await service.markAsWinner(passId, prizeId)

      expect(result.status).toBe('winner')
      expect(result.prizeId).toBe(prizeId)
    })
  })

  describe('getRafflePassStats', () => {
    it('should return stats for a raffle', async () => {
      const raffleId = 'raffle-1'

      mockPrisma.luckyPass.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(95)  // active
        .mockResolvedValueOnce(5)   // winners

      const result = await service.getRafflePassStats(raffleId)

      expect(result.total).toBe(100)
      expect(result.active).toBe(95)
      expect(result.winners).toBe(5)
    })
  })
})
