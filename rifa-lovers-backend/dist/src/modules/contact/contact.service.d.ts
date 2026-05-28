import { ResendService } from '../email/resend.service';
import { ContactFormDto } from './dto/contact-form.dto';
export declare class ContactService {
    private readonly resendService;
    constructor(resendService: ResendService);
    submitContactForm(dto: ContactFormDto): Promise<void>;
}
