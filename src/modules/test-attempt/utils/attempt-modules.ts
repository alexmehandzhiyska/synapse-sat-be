import { SECTION_ORDER } from '../../practice-test/constants/practice-test.constants';
import { Module } from '../../practice-test/entities/module.entity';
import { PracticeTest } from '../../practice-test/entities/practice-test.entity';
import { ModuleVariant, Section, TestType } from '../../practice-test/enums/practice-test.enums';

// Share of module 1 a student needs to get right to be routed to the hard module 2
export const ROUTING_THRESHOLD = 0.6;

export type ModuleRoutes = Partial<Record<Section, ModuleVariant>>;

export interface ModuleWithSection {
    sectionName: Section;
    module: Module;
}

// Only full tests have easy and hard module 2
export function isAdaptiveTest(test: PracticeTest): boolean {
    return test.type === TestType.STANDARD || test.type === TestType.DIAGNOSTIC;
}

export function getRouteForModule1(correct: number, total: number): ModuleVariant {
    return correct >= total * ROUTING_THRESHOLD ? ModuleVariant.HARD : ModuleVariant.EASY;
}

export function getAttemptModules(test: PracticeTest, moduleRoutes: ModuleRoutes): ModuleWithSection[] {
    const sections = [...test.sections].sort((a, b) => SECTION_ORDER.indexOf(a.name) - SECTION_ORDER.indexOf(b.name));

    return sections.flatMap((section) => {
        const modules = [...section.modules].sort((a, b) => a.position - b.position);

        if (!isAdaptiveTest(test)) {
            return modules.map((module) => ({ sectionName: section.name, module }));
        }

        const route = moduleRoutes[section.name] ?? ModuleVariant.HARD;

        return modules
            .filter((module) => module.position === 1 || module.variant === route)
            .map((module) => ({ sectionName: section.name, module }));
    });
}