import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PracticeTestModule } from './modules/practice-test/practice-test.module';
import { TestAttemptModule } from './modules/test-attempt/test-attempt.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USER ?? 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME ?? 'synapse_sat',
      autoLoadEntities: true,
      synchronize: false
    }),
    AuthModule,
    PracticeTestModule,
    TestAttemptModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
