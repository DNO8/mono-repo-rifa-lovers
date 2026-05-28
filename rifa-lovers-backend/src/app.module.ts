import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './modules/users/users.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { LuckyPassModule } from './modules/lucky-pass/lucky-pass.module';
import { RafflesModule } from './modules/raffles/raffles.module';
import { PacksModule } from './modules/packs/packs.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { DrawModule } from './modules/draw/draw.module';
import { TestimonialsModule } from './modules/testimonials/testimonials.module';
import { AdminModule } from './modules/admin/admin.module';
import { OperatorModule } from './modules/operator/operator.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { TicketReservationsModule } from './modules/ticket-reservations/ticket-reservations.module';
import { ContactModule } from './modules/contact/contact.module'
import { NewsletterModule } from './modules/newsletter/newsletter.module'
import { TasksModule } from './modules/tasks/tasks.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { throttlerConfig } from './config/throttler.config';
import { RecaptchaService } from './common/services/recaptcha.service';
import { IdempotencyGuard } from './common/guards/idempotency.guard'
import { IdempotencyInterceptor } from './common/interceptors/idempotency.interceptor'

@Module({
  imports: [
    // Fase 13 - Hardening: Rate Limiting
    ThrottlerModule.forRoot(throttlerConfig),

    // Fase 13 - Hardening: Logging con Pino
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
        redact: ['req.headers.authorization', 'req.headers.cookie'],
      },
    }),

    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    PurchasesModule,
    LuckyPassModule,
    RafflesModule,
    PacksModule,
    PaymentsModule,
    DrawModule,
    TestimonialsModule,
    AdminModule,
    OperatorModule,
    JobsModule,
    TicketReservationsModule,
    ContactModule,
    NewsletterModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    RecaptchaService,
    IdempotencyGuard,
    IdempotencyInterceptor,
    // Fase 13 - Hardening: Filtro de excepciones global
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
