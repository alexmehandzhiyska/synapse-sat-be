import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PracticeTestModule } from './modules/practice-test/practice-test.module';
import { TestAttemptModule } from './modules/test-attempt/test-attempt.module';
import { StudyPlanModule } from './modules/study-plan/study-plan.module';
import { UsersModule } from './modules/users/users.module';
import { NotebookModule } from './modules/notebook/notebook.module';
import { LessonsModule } from './modules/lessons/lessons.module';

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
      synchronize: false,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
    }),
    AuthModule,
    PracticeTestModule,
    TestAttemptModule,
    StudyPlanModule,
    UsersModule,
    NotebookModule,
    LessonsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}