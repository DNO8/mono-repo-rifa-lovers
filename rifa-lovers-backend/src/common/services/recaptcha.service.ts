import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface RecaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
}

@Injectable()
export class RecaptchaService {

  constructor(private readonly config: ConfigService) {}

  async verify(token: string): Promise<boolean> {
    const secretKey = this.config.get<string>('RECAPTCHA_SECRET_KEY');

    if (!secretKey) {
      return true;
    }

    try {
      const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          secret: secretKey,
          response: token,
        }).toString(),
      });

      const data = (await response.json()) as RecaptchaVerifyResponse;

      if (!data.success) {
      }

      return data.success === true;
    } catch (error) {
      return false;
    }
  }
}
