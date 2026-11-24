import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';
import { Flashcard } from './entities/flashcard.entity';
import { FlashcardRating } from './enums/flashcard-rating.enum';

const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const FORGOT_INTERVAL_DAYS = 1;
const FIRST_KNEW_IT_INTERVAL_DAYS = 3;

export function getNextIntervalDays(currentIntervalDays: number, rating: FlashcardRating): number {
    if (rating === FlashcardRating.FORGOT) {
        return FORGOT_INTERVAL_DAYS;
    }

    return currentIntervalDays === 0 ? FIRST_KNEW_IT_INTERVAL_DAYS : currentIntervalDays * 2;
}

// The part of the Free Dictionary API response the suggestion is taken from
interface DictionaryEntry {
    meanings: {
        definitions: { definition: string }[];
    }[];
}

@Injectable()
export class FlashcardsService {
    constructor(
        @InjectRepository(Flashcard)
        private readonly flashcardRepository: Repository<Flashcard>,
    ) { }

    getAll(userId: string): Promise<Flashcard[]> {
        return this.flashcardRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async create(userId: string, createFlashcardDto: CreateFlashcardDto): Promise<Flashcard> {
        // Trim and convert to lower case to avoid creating duplicates that just have different casing
        const word = createFlashcardDto.word.trim().toLowerCase();
        
        const existingFlashcard = await this.flashcardRepository.findOne({ where: { userId, word } });

        if (existingFlashcard) {
            throw new ConflictException('You already have a flashcard for this word.');
        }

        const flashcard = this.flashcardRepository.create({
            userId,
            word,
            definition: createFlashcardDto.definition,
            context: createFlashcardDto.context ?? null,
            questionId: createFlashcardDto.questionId ?? null,
        });

        return this.flashcardRepository.save(flashcard);
    }

    async delete(userId: string, id: string): Promise<void> {
        const result = await this.flashcardRepository.delete({ id, userId });

        if (result.affected === 0) {
            throw new NotFoundException(`Flashcard ${id} not found.`);
        }
    }

    async review(userId: string, id: string, reviewFlashcardDto: ReviewFlashcardDto): Promise<Flashcard> {
        const flashcard = await this.flashcardRepository.findOne({ where: { id, userId } });

        if (!flashcard) {
            throw new NotFoundException(`Flashcard ${id} not found.`);
        }

        flashcard.intervalDays = getNextIntervalDays(flashcard.intervalDays, reviewFlashcardDto.rating);
        flashcard.dueAt = new Date(Date.now() + flashcard.intervalDays * MS_PER_DAY);

        return this.flashcardRepository.save(flashcard);
    }

    // The suggestion is optional, so a word that's not in the dictionary doesn't know just gives no definition
    async getSuggestedDefinition(word: string): Promise<{ definition: string | null }> {
        try {
            const response = await fetch(`${DICTIONARY_API_URL}/${encodeURIComponent(word.trim().toLowerCase())}`);

            if (!response.ok) {
                return { definition: null };
            }

            const entries = (await response.json()) as DictionaryEntry[];
            return { definition: entries[0]?.meanings[0]?.definitions[0]?.definition ?? null };
        } catch {
            return { definition: null };
        }
    }
}