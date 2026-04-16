import { Test, TestingModule } from '@nestjs/testing'
import { DrawService } from './draw.service'
import { PrismaService } from '../../database/prisma.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('DrawService', () => {
  let service: DrawService
  let prisma: PrismaService

  const mockPrisma = {
    raffle: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    prizeWinner: {
      count: jest.fn(),
      create: jest.fn(),
    },
    prize: {
      findMany: jest.fn(),
    },
    luckyPass: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn(mockPrisma)),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrawService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile()

    service = module.get<DrawService>(DrawService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('executeDraw', () => {
    it('should execute draw within a transaction', async () => {
      const raffleId = 'raffle-1'
      const adminId = 'admin-1'

      mockPrisma.raffle.findUnique.mockResolvedValue({
        id: raffleId,
        status: 'closed',
        title: 'Test Raffle',
      })
      mockPrisma.prizeWinner.count.mockResolvedValue(0)
      mockPrisma.prize.findMany.mockResolvedValue([
        {
          id: 'prize-1',
          name: 'Prize 1',
          description: 'Desc',
          milestone: { sortOrder: 1 },
        },
      ])
      mockPrisma.luckyPass.findMany.mockResolvedValue([
        {
          id: 'pass-1',
          ticketNumber: 123,
          userId: 'user-1',
          status: 'active',
          user: { firstName: 'John', lastName: 'Doe', email: 'john@example.com' },
        },
      ])

      const result = await service.executeDraw(raffleId, adminId)

      // Verify transaction was used
      expect(mockPrisma.$transaction).toHaveBeenCalled()
      
      // Verify raffle status updated
      expect(mockPrisma.raffle.update).toHaveBeenCalledWith({
        where: { id: raffleId },
        data: { status: 'drawn' },
      })

      expect(result.winners).toHaveLength(1)
      expect(result.winners[0].passNumber).toBe(123)
    })

    it('should throw if raffle not found', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue(null)

      await expect(service.executeDraw('invalid-id', 'admin')).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw if raffle not closed', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'active',
      })

      await expect(service.executeDraw('raffle-1', 'admin')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw if draw already executed', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'closed',
      })
      mockPrisma.prizeWinner.count.mockResolvedValue(1)

      await expect(service.executeDraw('raffle-1', 'admin')).rejects.toThrow(
        BadRequestException,
      )
    })
  })

  describe('getDrawResults', () => {
    it('should return null if raffle not drawn', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'closed',
      })

      const result = await service.getDrawResults('raffle-1')
      expect(result).toBeNull()
    })

    it('should throw if raffle not found', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue(null)

      await expect(service.getDrawResults('invalid')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
