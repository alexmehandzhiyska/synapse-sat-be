import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Flashcard } from './entities/flashcard.entity';
import { FlashcardsController } from './flashcards.controller';
import { FlashcardsService } from './flashcards.service';

@Module({
    imports: [TypeOrmModule.forFeature([Flashcard])],
    controllers: [FlashcardsController],
    providers: [FlashcardsService],
})
export class FlashcardsModule { }