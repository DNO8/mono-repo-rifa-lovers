import { ResendService } from '../email/resend.service';
import { ContactFormDto } from './dto/contact-form.dto';
export declare class ContactService {
    private readonly resendService;
    private readonly logger;
    constructor(resendService: ResendService);
    submitContactForm(dto: ContactFormDto): Promise<void>;
}
