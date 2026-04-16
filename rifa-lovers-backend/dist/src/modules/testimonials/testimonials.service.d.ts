import { PrismaService } from '../../database/prisma.service';
export interface CreateTestimonialDto {
    raffleId: string;
    luckyPassId: string;
    text: string;
    rating: number;
}
export interface TestimonialResponse {
    id: string;
    raffleId: string;
    text: string;
    rating: number;
    isPublished: boolean;
    createdAt: string;
    userName: string | null;
}
export declare class TestimonialsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateTestimonialDto): Promise<TestimonialResponse>;
    getPublishedByRaffle(raffleId: string): Promise<TestimonialResponse[]>;
    getAll(): Promise<(TestimonialResponse & {
        userEmail: string | null;
    })[]>;
    publish(id: string, isPublished: boolean): Promise<TestimonialResponse>;
}
