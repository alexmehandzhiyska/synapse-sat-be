import { IsEnum } from 'class-validator';

import { FlashcardRating } from '../enums/flashcard-rating.enum';

export class ReviewFlashcardDto {
    @IsEnum(FlashcardRating)
    rating: FlashcardRating;
}