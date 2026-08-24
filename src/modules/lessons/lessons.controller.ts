import { Body, Controller, Get, Param, ParseEnumPipe, Post, UseGuards } from '@nestjs/common';

import { TeacherGuard } from '../auth/guards/teacher.guard';
import { Domain } from '../practice-test/enums/practice-test.enums';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';

@UseGuards(TeacherGuard)
@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }

    @Get()
    getAll() {
        return this.lessonsService.getAll();
    }

    @Post('domains/:domain')
    add(
        @Param('domain', new ParseEnumPipe(Domain)) domain: Domain,
        @Body() dto: CreateLessonDto,
    ) {
        return this.lessonsService.add(domain, dto);
    }
}