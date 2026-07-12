import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PracticeTestService } from './practice-test.service';
import { CreatePracticeTestDto } from './dto/create-practice-test.dto';
import { UpdatePracticeTestDto } from './dto/update-practice-test.dto';

@Controller('practice-test')
export class PracticeTestController {
    constructor(private readonly practiceTestService: PracticeTestService) { }

    @Post()
    create(@Body() createPracticeTestDto: CreatePracticeTestDto) {
        return this.practiceTestService.create(createPracticeTestDto);
    }

    @Get()
    findAll() {
        return this.practiceTestService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.practiceTestService.findOne(+id);
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
