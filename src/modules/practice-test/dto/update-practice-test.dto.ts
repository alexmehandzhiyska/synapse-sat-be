import { PartialType } from '@nestjs/mapped-types';
import { CreatePracticeTestDto } from './create-practice-test.dto';

export class UpdatePracticeTestDto extends PartialType(CreatePracticeTestDto) {}
