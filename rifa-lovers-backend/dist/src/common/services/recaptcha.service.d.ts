import { ConfigService } from '@nestjs/config';
export declare class RecaptchaService {
    private readonly config;
    constructor(config: ConfigService);
    verify(token: string): Promise<boolean>;
}
