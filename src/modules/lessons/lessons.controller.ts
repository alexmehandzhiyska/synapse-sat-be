import { Controller, Get, Param, ParseEnumPipe, Patch, Post, Body, Req, UseGuards } from '@nestjs/common';

import { StudentGuard } from '../auth/guards/student.guard';
import { TeacherGuard } from '../auth/guards/teacher.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { Domain } from '../practice-test/enums/practice-test.enums';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

@Controller('lessons')
export class LessonsController {
    constructor(private readonly lessonsService: LessonsService) { }

    @UseGuards(TeacherGuard)
    @Get()
    getAll() {
        return this.lessonsService.getAll();
    }

    @UseGuards(TeacherGuard)
    @Post('domains/:domain')
    add(
        @Param('domain', new ParseEnumPipe(Domain)) domain: Domain,
        @Body() dto: CreateLessonDto,
    ) {
        return this.lessonsService.add(domain, dto);
    }

    @UseGuards(TeacherGuard)
    @Patch(':lessonId')
    update(@Param('lessonId') lessonId: string, @Body() dto: UpdateLessonDto) {
        return this.lessonsService.update(lessonId, dto);
    }

    @UseGuards(StudentGuard)
    @Get('progress')
    getProgress(@Req() req: AuthenticatedRequest) {
        return this.lessonsService.getProgress(req.user.userId);
    }

    @UseGuards(StudentGuard)
    @Post(':lessonId/complete')
    completeLesson(@Param('lessonId') lessonId: string, @Req() req: AuthenticatedRequest) {
        return this.lessonsService.completeLesson(lessonId, req.user.userId);
    }
}
