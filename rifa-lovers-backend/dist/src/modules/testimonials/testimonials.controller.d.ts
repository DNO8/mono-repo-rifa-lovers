import { TestimonialsService } from './testimonials.service';
import type { CreateTestimonialDto } from './testimonials.service';
export declare class TestimonialsController {
    private readonly testimonialsService;
    constructor(testimonialsService: TestimonialsService);
    create(userId: string, dto: CreateTestimonialDto): Promise<import("./testimonials.service").TestimonialResponse>;
    getPublished(raffleId: string): Promise<import("./testimonials.service").TestimonialResponse[]>;
    getAll(): Promise<(import("./testimonials.service").TestimonialResponse & {
        userEmail: string | null;
    })[]>;
    publish(id: string, body: {
        isPublished: boolean;
    }): Promise<import("./testimonials.service").TestimonialResponse>;
}
