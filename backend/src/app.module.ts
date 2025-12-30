import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { GsiModule } from './gsi/gsi.module';
import { BankModule } from './bank/bank.module';
import { PersonModule } from './person/person.module';
import { AccountsPayableModule } from './accounts-payable/accounts-payable.module';
import { AccountsReceivableModule } from './accounts-receivable/accounts-receivable.module';
import { UploadModule } from './upload/upload.module';
import { ReportsModule } from './reports/reports.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    GsiModule,
    BankModule,
    PersonModule,
    AccountsPayableModule,
    AccountsReceivableModule,
    UploadModule,
    ReportsModule,
  ],
})
export class AppModule {}

