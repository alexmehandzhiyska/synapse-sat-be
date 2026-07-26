import { Section } from '../enums/practice-test.enums';
import { Module } from '../entities/module.entity';

// Official digital SAT (Bluebook) per-module time limits.
export const SECTION_TIME_LIMITS_MINUTES: Record<Section, number> = {
    [Section.READING_WRITING]: 32,
    [Section.MATH]: 35,
};

export function resolveModuleTimeLimit(module: Module): number {
    return module.timeLimitMinutes ?? SECTION_TIME_LIMITS_MINUTES[module.section.name];
}
