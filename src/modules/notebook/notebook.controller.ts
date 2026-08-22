import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface';
import { CreateNotebookEntryDto } from './dto/create-notebook-entry.dto';
import { UpdateNotebookEntryDto } from './dto/update-notebook-entry.dto';
import { NotebookService } from './notebook.service';

@UseGuards(JwtAuthGuard)
@Controller('notebook')
export class NotebookController {
    constructor(private readonly notebookService: NotebookService) { }

    @Get()
    getByUser(@Req() req: AuthenticatedRequest) {
        return this.notebookService.getByUser(req.user.userId);
    }

    @Post()
    create(@Body() createNotebookEntryDto: CreateNotebookEntryDto, @Req() req: AuthenticatedRequest) {
        return this.notebookService.create(req.user.userId, createNotebookEntryDto);
    }

    @Patch(':id')
    update(
        @Param('id') id: string,
        @Body() updateNotebookEntryDto: UpdateNotebookEntryDto,
        @Req() req: AuthenticatedRequest,
    ) {
        return this.notebookService.update(req.user.userId, id, updateNotebookEntryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
        return this.notebookService.remove(req.user.userId, id);
    }
}