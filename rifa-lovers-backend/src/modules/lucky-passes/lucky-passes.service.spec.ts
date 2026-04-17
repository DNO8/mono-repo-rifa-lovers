import { Test, TestingModule } from '@nestjs/testing'
import { NotFoundException } from '@nestjs/common'
import { LuckyPassService } from '../lucky-pass/lucky-pass.service'
import { LuckyPassRepository } from '../lucky-pass/lucky-pass.repository'
import { RafflesRepository } from '../raffles/raffles.repository'

describe('LuckyPassService', () => {
  let service: LuckyPassService

  const mockLuckyPassRepository = {
    findByUser: jest.fn(),
    findUnique: jest.fn(),
    findByRaffle: jest.fn(),
    findByTicketNumber: jest.fn(),
    markAsWinner: jest.fn(),
    countByUserAndStatus: jest.fn(),
    countWinnersByUser: jest.fn(),
  }

  const mockRafflesRepository = {
    findUnique: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LuckyPassService,
        { provide: LuckyPassRepository, useValue: mockLuckyPassRepository },
        { provide: RafflesRepository, useValue: mockRafflesRepository },
      ],
    }).compile()

    service = module.get<LuckyPassService>(LuckyPassService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('findByUser', () => {
    it('should return user lucky passes', async () => {
      const userId = 'user-1'
      const mockPasses = [
        {
          id: 'pass-1',
          userId,
          raffleId: 'raffle-1',
          ticketNumber: 1234,
          status: 'active',
          isWinner: false,
          createdAt: new Date(),
          raffle: { id: 'raffle-1', title: 'Test Raffle' },
        },
      ]

      mockLuckyPassRepository.findByUser.mockResolvedValue(mockPasses)

      const result = await service.findByUser(userId)

      expect(result).toHaveLength(1)
      expect(mockLuckyPassRepository.findByUser).toHaveBeenCalledWith(userId, { raffle: true })
    })

    it('should return empty array if user has no passes', async () => {
      mockLuckyPassRepository.findByUser.mockResolvedValue([])

      const result = await service.findByUser('user-no-passes')

      expect(result).toHaveLength(0)
    })
  })

  describe('getSummary', () => {
    it('should return summary with correct counts', async () => {
      const userId = 'user-1'

      mockLuckyPassRepository.countByUserAndStatus
        .mockResolvedValueOnce(10)  // total (no status filter)
        .mockResolvedValueOnce(7)   // active
        .mockResolvedValueOnce(2)   // used
      mockLuckyPassRepository.countWinnersByUser.mockResolvedValue(1)

      const result = await service.getSummary(userId)

      expect(result.totalPasses).toBe(10)
      expect(result.activePasses).toBe(7)
      expect(result.usedPasses).toBe(2)
      expect(result.winnerPasses).toBe(1)
    })

    it('should return zero counts for new user', async () => {
      mockLuckyPassRepository.countByUserAndStatus.mockResolvedValue(0)
      mockLuckyPassRepository.countWinnersByUser.mockResolvedValue(0)

      const result = await service.getSummary('new-user')

      expect(result.totalPasses).toBe(0)
      expect(result.activePasses).toBe(0)
      expect(result.winnerPasses).toBe(0)
    })
  })

  describe('findById', () => {
    it('should return pass by ID', async () => {
      mockLuckyPassRepository.findUnique.mockResolvedValue({
        id: 'pass-1',
        userId: 'user-1',
        raffleId: 'raffle-1',
        ticketNumber: 1234,
        status: 'active',
        isWinner: false,
        createdAt: new Date(),
        raffle: { id: 'raffle-1', title: 'Test Raffle' },
      })

      const result = await service.findById('pass-1')

      expect(result).toHaveProperty('id')
    })

    it('should throw NotFoundException if pass not found', async () => {
      mockLuckyPassRepository.findUnique.mockResolvedValue(null)

      await expect(service.findById('invalid')).rejects.toThrow(NotFoundException)
    })
  })

  describe('checkAvailability', () => {
    it('should return available=true for free ticket number', async () => {
      mockRafflesRepository.findUnique.mockResolvedValue({
        id: 'raffle-1',
        maxTicketNumber: 1000,
      })
      mockLuckyPassRepository.findByTicketNumber.mockResolvedValue(null)

      const result = await service.checkAvailability('raffle-1', 42)

      expect(result.available).toBe(true)
    })

    it('should return available=false for taken ticket number', async () => {
      mockRafflesRepository.findUnique.mockResolvedValue({
        id: 'raffle-1',
        maxTicketNumber: 1000,
      })
      mockLuckyPassRepository.findByTicketNumber.mockResolvedValue({
        id: 'pass-1',
        ticketNumber: 42,
      })

      const result = await service.checkAvailability('raffle-1', 42)

      expect(result.available).toBe(false)
    })

    it('should return available=false if raffle not found', async () => {
      mockRafflesRepository.findUnique.mockResolvedValue(null)

      const result = await service.checkAvailability('invalid', 1)

      expect(result.available).toBe(false)
    })

    it('should return available=false if ticket number out of range', async () => {
      mockRafflesRepository.findUnique.mockResolvedValue({
        id: 'raffle-1',
        maxTicketNumber: 100,
      })

      const result = await service.checkAvailability('raffle-1', 101)

      expect(result.available).toBe(false)
    })

    it('should return available=false for ticket number 0', async () => {
      mockRafflesRepository.findUnique.mockResolvedValue({
        id: 'raffle-1',
        maxTicketNumber: 100,
      })

      const result = await service.checkAvailability('raffle-1', 0)

      expect(result.available).toBe(false)
    })
  })

  describe('markAsWinner', () => {
    it('should mark pass as winner and return updated data', async () => {
      const passId = 'pass-1'

      mockLuckyPassRepository.markAsWinner.mockResolvedValue({
        id: passId,
        status: 'winner',
        isWinner: true,
      })
      mockLuckyPassRepository.findUnique.mockResolvedValue({
        id: passId,
        status: 'winner',
        isWinner: true,
        raffleId: 'raffle-1',
        ticketNumber: 123,
        createdAt: new Date(),
        raffle: { id: 'raffle-1', title: 'Test Raffle' },
      })

      await service.markAsWinner(passId)

      expect(mockLuckyPassRepository.markAsWinner).toHaveBeenCalledWith(passId)
    })

    it('should throw if updated pass not found after marking', async () => {
      mockLuckyPassRepository.markAsWinner.mockResolvedValue({ id: 'pass-1' })
      mockLuckyPassRepository.findUnique.mockResolvedValue(null)

      await expect(service.markAsWinner('pass-1')).rejects.toThrow(NotFoundException)
    })
  })
})
