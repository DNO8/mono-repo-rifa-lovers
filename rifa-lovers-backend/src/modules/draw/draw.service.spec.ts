import { Test, TestingModule } from '@nestjs/testing'
import { DrawService } from './draw.service'
import { PrismaService } from '../../database/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'
import { BadRequestException, NotFoundException } from '@nestjs/common'

describe('DrawService', () => {
  let service: DrawService

  const mockPrisma = {
    raffle: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    prizeWinner: {
      count: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
    },
    prize: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    luckyPass: {
      findMany: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn((fn) => fn(mockPrisma)),
  }

  const mockNotifications = {
    sendWinnerEmail: jest.fn().mockResolvedValue(undefined),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DrawService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: NotificationsService, useValue: mockNotifications },
      ],
    }).compile()

    service = module.get<DrawService>(DrawService)
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

    it('should throw if no unlocked prizes', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'closed',
      })
      mockPrisma.prizeWinner.count.mockResolvedValue(0)
      mockPrisma.prize.findMany.mockResolvedValue([])

      await expect(service.executeDraw('raffle-1', 'admin')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should throw if no active passes', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'closed',
      })
      mockPrisma.prizeWinner.count.mockResolvedValue(0)
      mockPrisma.prize.findMany.mockResolvedValue([
        { id: 'prize-1', name: 'Prize', milestone: { sortOrder: 1 } },
      ])
      mockPrisma.luckyPass.findMany.mockResolvedValue([])

      await expect(service.executeDraw('raffle-1', 'admin')).rejects.toThrow(
        BadRequestException,
      )
    })

    it('should assign multiple prizes to different participants', async () => {
      const raffleId = 'raffle-1'

      mockPrisma.raffle.findUnique.mockResolvedValue({
        id: raffleId,
        status: 'closed',
        title: 'Multi Prize Raffle',
      })
      mockPrisma.prizeWinner.count.mockResolvedValue(0)
      mockPrisma.prize.findMany.mockResolvedValue([
        { id: 'prize-1', name: 'First Prize', description: null, milestone: { sortOrder: 1 } },
        { id: 'prize-2', name: 'Second Prize', description: null, milestone: { sortOrder: 2 } },
      ])
      mockPrisma.luckyPass.findMany.mockResolvedValue([
        { id: 'pass-1', ticketNumber: 10, userId: 'user-1', status: 'active', user: { firstName: 'Ana', lastName: 'B', email: 'ana@test.com' } },
        { id: 'pass-2', ticketNumber: 20, userId: 'user-2', status: 'active', user: { firstName: 'Carlos', lastName: 'D', email: 'carlos@test.com' } },
        { id: 'pass-3', ticketNumber: 30, userId: 'user-3', status: 'active', user: { firstName: 'Eve', lastName: 'F', email: 'eve@test.com' } },
      ])

      const result = await service.executeDraw(raffleId, 'admin-1')

      expect(result.winners).toHaveLength(2)
      expect(result.raffleId).toBe(raffleId)
      expect(result.drawnAt).toBeInstanceOf(Date)

      // Each winner should have a different luckyPassId
      const passIds = result.winners.map((w) => w.luckyPassId)
      expect(new Set(passIds).size).toBe(2)

      // prizeWinner.create called once per prize
      expect(mockPrisma.prizeWinner.create).toHaveBeenCalledTimes(2)
      // luckyPass.update called once per winner
      expect(mockPrisma.luckyPass.update).toHaveBeenCalledTimes(2)
    })

    it('should handle more prizes than participants gracefully', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'closed',
        title: 'Test',
      })
      mockPrisma.prizeWinner.count.mockResolvedValue(0)
      mockPrisma.prize.findMany.mockResolvedValue([
        { id: 'prize-1', name: 'Prize 1', description: null, milestone: { sortOrder: 1 } },
        { id: 'prize-2', name: 'Prize 2', description: null, milestone: { sortOrder: 2 } },
        { id: 'prize-3', name: 'Prize 3', description: null, milestone: { sortOrder: 3 } },
      ])
      mockPrisma.luckyPass.findMany.mockResolvedValue([
        { id: 'pass-1', ticketNumber: 1, userId: 'user-1', status: 'active', user: { firstName: 'Solo', lastName: 'Player', email: 'solo@test.com' } },
      ])

      const result = await service.executeDraw('raffle-1', 'admin-1')

      // Only 1 winner assigned (not enough passes for all prizes)
      expect(result.winners).toHaveLength(1)
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

    it('should return winners when raffle is drawn', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({
        id: 'raffle-1',
        status: 'drawn',
      })
      mockPrisma.prizeWinner.findMany.mockResolvedValue([
        {
          prizeId: 'prize-1',
          luckyPassId: 'pass-1',
          userId: 'user-1',
          createdAt: new Date('2025-01-01'),
          prize: { name: 'Grand Prize', description: 'The big one' },
          luckyPass: { ticketNumber: 42 },
          user: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
        },
      ])

      const result = await service.getDrawResults('raffle-1')

      expect(result).not.toBeNull()
      expect(result!.raffleId).toBe('raffle-1')
      expect(result!.winners).toHaveLength(1)
      expect(result!.winners[0].prizeName).toBe('Grand Prize')
      expect(result!.winners[0].passNumber).toBe(42)
      expect(result!.winners[0].winnerName).toBe('John Doe')
      expect(result!.winners[0].userEmail).toBe('john@test.com')
    })
  })

  describe('canExecuteDraw', () => {
    it('should return canDraw=true when conditions met', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({ id: 'raffle-1', status: 'closed' })
      mockPrisma.prizeWinner.count.mockResolvedValue(0)
      mockPrisma.prize.count.mockResolvedValue(3)
      mockPrisma.luckyPass.count.mockResolvedValue(50)

      const result = await service.canExecuteDraw('raffle-1')

      expect(result.canDraw).toBe(true)
      expect(result.prizesCount).toBe(3)
      expect(result.activePassesCount).toBe(50)
    })

    it('should return canDraw=false if raffle not found', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue(null)

      const result = await service.canExecuteDraw('invalid')

      expect(result.canDraw).toBe(false)
      expect(result.reason).toContain('no encontrada')
    })

    it('should return canDraw=false if raffle not closed', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({ id: 'raffle-1', status: 'active' })

      const result = await service.canExecuteDraw('raffle-1')

      expect(result.canDraw).toBe(false)
      expect(result.reason).toContain('cerrada')
    })

    it('should return canDraw=false if draw already executed', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({ id: 'raffle-1', status: 'closed' })
      mockPrisma.prizeWinner.count.mockResolvedValue(5)

      const result = await service.canExecuteDraw('raffle-1')

      expect(result.canDraw).toBe(false)
      expect(result.reason).toContain('ya ha sido ejecutado')
    })

    it('should return canDraw=false if no unlocked prizes', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({ id: 'raffle-1', status: 'closed' })
      mockPrisma.prizeWinner.count.mockResolvedValue(0)
      mockPrisma.prize.count.mockResolvedValue(0)
      mockPrisma.luckyPass.count.mockResolvedValue(10)

      const result = await service.canExecuteDraw('raffle-1')

      expect(result.canDraw).toBe(false)
      expect(result.reason).toContain('No hay premios')
    })

    it('should return canDraw=false if no active passes', async () => {
      mockPrisma.raffle.findUnique.mockResolvedValue({ id: 'raffle-1', status: 'closed' })
      mockPrisma.prizeWinner.count.mockResolvedValue(0)
      mockPrisma.prize.count.mockResolvedValue(3)
      mockPrisma.luckyPass.count.mockResolvedValue(0)

      const result = await service.canExecuteDraw('raffle-1')

      expect(result.canDraw).toBe(false)
      expect(result.reason).toContain('No hay LuckyPasses')
    })
  })
})
