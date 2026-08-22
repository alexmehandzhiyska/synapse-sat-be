import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Question } from '../practice-test/entities/question.entity';
import { NotebookEntry } from './entities/notebook-entry.entity';
import { NotebookController } from './notebook.controller';
import { NotebookService } from './notebook.service';

@Module({
    imports: [TypeOrmModule.forFeature([NotebookEntry, Question])],
    controllers: [NotebookController],
    providers: [NotebookService],
})
export class NotebookModule { }
