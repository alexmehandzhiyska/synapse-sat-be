import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PracticeTestService } from './practice-test.service';
import { CreatePracticeTestDto } from './dto/create-practice-test.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdatePracticeTestDto } from './dto/update-practice-test.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TeacherGuard } from '../auth/guards/teacher.guard';

@Controller('practice-test')
export class PracticeTestController {
    constructor(private readonly practiceTestService: PracticeTestService) { }

    @UseGuards(TeacherGuard)
    @Post()
    create(@Body() createPracticeTestDto: CreatePracticeTestDto) {
        return this.practiceTestService.create(createPracticeTestDto);
    }

    @Get()
    findAll() {
        return this.practiceTestService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get('diagnostic')
    findDiagnostic() {
        return this.practiceTestService.findDiagnostic();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.practiceTestService.findOne(id);
    }

    @UseGuards(TeacherGuard)
    @Post('modules/:moduleId/questions')
    createQuestion(@Param('moduleId') moduleId: string, @Body() createQuestionDto: CreateQuestionDto) {
        return this.practiceTestService.createQuestion(moduleId, createQuestionDto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePracticeTestDto: UpdatePracticeTestDto) {
        return this.practiceTestService.update(+id, updatePracticeTestDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.practiceTestService.remove(+id);
    }
}