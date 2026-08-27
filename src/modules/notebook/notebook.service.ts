import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Question } from '../practice-test/entities/question.entity';
import { CreateNotebookEntryDto } from './dto/create-notebook-entry.dto';
import { UpdateNotebookEntryDto } from './dto/update-notebook-entry.dto';
import { NotebookEntry } from './entities/notebook-entry.entity';

@Injectable()
export class NotebookService {
    constructor(
        @InjectRepository(NotebookEntry)
        private readonly notebookRepository: Repository<NotebookEntry>,
        @InjectRepository(Question)
        private readonly questionRepository: Repository<Question>,
    ) { }

    async getByUser(userId: string) {
        const entries = await this.notebookRepository.find({
            where: { userId },
            relations: { question: { answerChoices: true } },
            order: { createdAt: 'DESC' },
        });

        return entries.map((entry) => this.toResponse(entry));
    }

    async create(userId: string, createNotebookEntryDto: CreateNotebookEntryDto) {
        const question = await this.questionRepository.findOne({
            where: { id: createNotebookEntryDto.questionId },
            relations: { answerChoices: true },
        });

        if (!question) {
            throw new NotFoundException(`Question ${createNotebookEntryDto.questionId} not found.`);
        }

        const existingEntry = await this.notebookRepository.findOne({
            where: { userId, questionId: createNotebookEntryDto.questionId },
        });

        if (existingEntry) {
            throw new ConflictException('This question is already in your notebook.');
        }

        const entry = this.notebookRepository.create({
            userId,
            questionId: createNotebookEntryDto.questionId,
            what: createNotebookEntryDto.what,
            why: createNotebookEntryDto.why,
            how: createNotebookEntryDto.how,
        });

        const savedEntry = await this.notebookRepository.save(entry);
        savedEntry.question = question;

        return this.toResponse(savedEntry);
    }

    async update(userId: string, id: string, updateNotebookEntryDto: UpdateNotebookEntryDto) {
        const entry = await this.getOwnedEntry(id, userId);

        entry.what = updateNotebookEntryDto.what;
        entry.why = updateNotebookEntryDto.why;
        entry.how = updateNotebookEntryDto.how;
        await this.notebookRepository.save(entry);

        return this.toResponse(entry);
    }

    async remove(userId: string, id: string): Promise<void> {
        await this.getOwnedEntry(id, userId);
        await this.notebookRepository.delete(id);
    }

    private async getOwnedEntry(id: string, userId: string): Promise<NotebookEntry> {
        const entry = await this.notebookRepository.findOne({
            where: { id },
            relations: { question: { answerChoices: true } },
        });

        if (!entry || entry.userId !== userId) {
            throw new NotFoundException(`Notebook entry ${id} not found.`);
        }

        return entry;
    }

    private toResponse(entry: NotebookEntry) {
        return {
            id: entry.id,
            questionId: entry.questionId,
            question: {
                id: entry.question.id,
                prompt: entry.question.prompt,
                passage: entry.question.passage,
                domain: entry.question.domain,
                answerChoices: [...entry.question.answerChoices]
                    .sort((a, b) => a.label.localeCompare(b.label))
                    .map((choice) => ({
                        id: choice.id,
                        label: choice.label,
                        content: choice.content,
                        isCorrect: choice.isCorrect,
                    })),
            },
            what: entry.what,
            why: entry.why,
            how: entry.how,
            createdAt: entry.createdAt,
            updatedAt: entry.updatedAt,
        };
    }
}