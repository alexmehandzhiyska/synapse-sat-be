import {
    Body,
    Controller,
    Get,
    HttpCode,
    Param,
    Post,
    Put,
    Req,
    UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateTestAttemptDto } from './dto/create-test-attempt.dto';
import { UpsertAnswerDto } from './dto/upsert-answer.dto';
import { TestAttemptService } from './test-attempt.service';

@UseGuards(JwtAuthGuard)
@Controller('test-attempts')
export class TestAttemptController {
    constructor(private readonly testAttemptService: TestAttemptService) { }

    @Get(':attemptId')
    getOne(@Param('attemptId') attemptId: string, @Req() req: AuthenticatedRequest) {
        return this.testAttemptService.getOne(attemptId, req.user.userId);
    }

    @Get(':attemptId/score')
    getScore(@Param('attemptId') attemptId: string, @Req() req: AuthenticatedRequest) {
        return this.testAttemptService.getScore(attemptId, req.user.userId);
    }

    @Post()
    startOrResume(@Body() dto: CreateTestAttemptDto, @Req() req: AuthenticatedRequest) {
        return this.testAttemptService.startOrResume(dto.testId, req.user.userId);
    }

    @Put(':attemptId/answers/:questionId')
    @HttpCode(204)
    upsertAnswer(
        @Param('attemptId') attemptId: string,
        @Param('questionId') questionId: string,
        @Body() dto: UpsertAnswerDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.testAttemptService.upsertAnswer(attemptId, questionId, dto, req.user.userId);
    }

    @Post(':attemptId/advance-module')
    advanceModule(@Param('attemptId') attemptId: string, @Req() req: AuthenticatedRequest) {
        return this.testAttemptService.advanceModule(attemptId, req.user.userId);
    }

    @Post(':attemptId/submit')
    submit(@Param('attemptId') attemptId: string, @Req() req: AuthenticatedRequest) {
        return this.testAttemptService.submit(attemptId, req.user.userId);
    }
}