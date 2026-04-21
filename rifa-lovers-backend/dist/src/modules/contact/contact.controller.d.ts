import { ContactService } from './contact.service';
import { ContactFormDto } from './dto/contact-form.dto';
export declare class ContactController {
    private readonly contactService;
    constructor(contactService: ContactService);
    submitContactForm(dto: ContactFormDto): Promise<{
        message: string;
    }>;
}
