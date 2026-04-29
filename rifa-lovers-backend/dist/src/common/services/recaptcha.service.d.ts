import { ConfigService } from '@nestjs/config';
export declare class RecaptchaService {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    verify(token: string): Promise<boolean>;
}
