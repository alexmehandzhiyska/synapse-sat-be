import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';

import { StudentGuard } from '../auth/guards/student.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';
import { FlashcardsService } from './flashcards.service';

@UseGuards(StudentGuard)
@Controller('flashcards')
export class FlashcardsController {
    constructor(private readonly flashcardsService: FlashcardsService) { }

    @Get()
    getAll(@Req() req: AuthenticatedRequest) {
        return this.flashcardsService.getAll(req.user.userId);
    }

    @Get('definition')
    getSuggestedDefinition(@Query('word') word: string) {
        return this.flashcardsService.getSuggestedDefinition(word);
    }

    @Post()
    create(@Body() createFlashcardDto: CreateFlashcardDto, @Req() req: AuthenticatedRequest) {
        return this.flashcardsService.create(req.user.userId, createFlashcardDto);
    }

    @Patch(':id/review')
    review(@Param('id') id: string, @Body() reviewFlashcardDto: ReviewFlashcardDto, @Req() req: AuthenticatedRequest) {
        return this.flashcardsService.review(req.user.userId, id, reviewFlashcardDto);
    }

    @Delete(':id')
    delete(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        return this.flashcardsService.delete(req.user.userId, id);
    }
}