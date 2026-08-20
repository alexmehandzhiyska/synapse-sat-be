import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { UpsertStudyPlanDto } from './dto/upsert-study-plan.dto';
import { StudyPlanService } from './study-plan.service';

@UseGuards(JwtAuthGuard)
@Controller('study-plan')
export class StudyPlanController {
    constructor(private readonly studyPlanService: StudyPlanService) { }

    @Get('test-dates')
    getTestDates() {
        return this.studyPlanService.getTestDates();
    }

    @Get()
    getOne(@Req() req: AuthenticatedRequest) {
        return this.studyPlanService.getOne(req.user.userId);
    }

    @Put()
    upsert(@Body() upsertStudyPlanDto: UpsertStudyPlanDto, @Req() req: AuthenticatedRequest) {
        return this.studyPlanService.upsert(req.user.userId, upsertStudyPlanDto);
    }
}