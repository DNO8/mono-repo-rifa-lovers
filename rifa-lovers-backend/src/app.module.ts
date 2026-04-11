import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    UsersModule,
    PurchasesModule,
    LuckyPassModule,
    RafflesModule,
    PacksModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
