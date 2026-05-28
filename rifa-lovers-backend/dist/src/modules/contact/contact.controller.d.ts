import { ContactService } from './contact.service';
import { RecaptchaService } from '../../common/services/recaptcha.service';
import { ContactFormDto } from './dto/contact-form.dto';
export declare class ContactController {
    private readonly contactService;
    private readonly recaptchaService;
    private readonly logger;
    constructor(contactService: ContactService, recaptchaService: RecaptchaService);
    submitContactForm(dto: ContactFormDto): Promise<{
        message: string;
    }>;
}
