import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { Flashcard } from './entities/flashcard.entity';

const DICTIONARY_API_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';

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