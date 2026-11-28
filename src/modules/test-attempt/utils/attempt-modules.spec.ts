import { PracticeTest } from '../../practice-test/entities/practice-test.entity';
import { ModuleVariant, Section, TestType } from '../../practice-test/enums/practice-test.enums';

import { getAttemptModules, getRouteForModule1, isAdaptiveTest } from './attempt-modules';

const buildModule = (id: string, position: number, variant: ModuleVariant | null = null) => ({ id, position, variant });

const buildTest = (type: TestType, sections: { name: Section; modules: ReturnType<typeof buildModule>[] }[]) =>
    ({ type, sections }) as unknown as PracticeTest;

const buildFullSection = (name: Section, prefix: string) => ({
    name,
    modules: [
        buildModule(`${prefix}-hard`, 2, ModuleVariant.HARD),
        buildModule(`${prefix}-1`, 1),
        buildModule(`${prefix}-easy`, 2, ModuleVariant.EASY),
    ],
});

const moduleIds = (test: PracticeTest, routes = {}) =>
    getAttemptModules(test, routes).map(({ module }) => module.id);

describe('isAdaptiveTest', () => {
    it('returns true for standard test', () => {
        expect(isAdaptiveTest(buildTest(TestType.STANDARD, []))).toBe(true);
    });

    it('returns true for diagnostic test', () => {
        expect(isAdaptiveTest(buildTest(TestType.DIAGNOSTIC, []))).toBe(true);
    });

    it('returns false for check-in test', () => {
        expect(isAdaptiveTest(buildTest(TestType.CHECK_IN, []))).toBe(false);
    });

    it('returns false for custom test', () => {
        expect(isAdaptiveTest(buildTest(TestType.CUSTOM, []))).toBe(false);
    });
});

describe('getRouteForModule1', () => {
    it('routes to hard at threshold', () => {
        expect(getRouteForModule1(6, 10)).toBe(ModuleVariant.HARD);
    });

    it('routes to hard above threshold', () => {
        expect(getRouteForModule1(10, 10)).toBe(ModuleVariant.HARD);
    });

    it('routes to easy below threshold', () => {
        expect(getRouteForModule1(5, 10)).toBe(ModuleVariant.EASY);
    });

    it('routes to easy with no correct answers', () => {
        expect(getRouteForModule1(0, 10)).toBe(ModuleVariant.EASY);
    });

    it('routes to hard for empty module', () => {
        expect(getRouteForModule1(0, 0)).toBe(ModuleVariant.HARD);
    });
});

describe('getAttemptModules', () => {
    it('orders reading & writing before math', () => {
        const test = buildTest(TestType.STANDARD, [
            buildFullSection(Section.MATH, 'math'),
            buildFullSection(Section.READING_WRITING, 'rw'),
        ]);

        expect(getAttemptModules(test, {}).map(({ sectionName }) => sectionName)).toEqual([
            Section.READING_WRITING,
            Section.READING_WRITING,
            Section.MATH,
            Section.MATH,
        ]);
    });

    it('takes routed module 2 per section', () => {
        const test = buildTest(TestType.STANDARD, [
            buildFullSection(Section.READING_WRITING, 'rw'),
            buildFullSection(Section.MATH, 'math'),
        ]);

        expect(moduleIds(test, { [Section.READING_WRITING]: ModuleVariant.EASY, [Section.MATH]: ModuleVariant.HARD })).toEqual([
            'rw-1',
            'rw-easy',
            'math-1',
            'math-hard',
        ]);
    });

    it('defaults to hard module 2 without route', () => {
        const test = buildTest(TestType.DIAGNOSTIC, [buildFullSection(Section.MATH, 'math')]);

        expect(moduleIds(test)).toEqual(['math-1', 'math-hard']);
    });

    it('returns every module of non-adaptive test by position', () => {
        const test = buildTest(TestType.CUSTOM, [
            { name: Section.MATH, modules: [buildModule('math-2', 2), buildModule('math-1', 1)] },
        ]);

        expect(moduleIds(test, { [Section.MATH]: ModuleVariant.EASY })).toEqual(['math-1', 'math-2']);
    });

    it('does not mutate test', () => {
        const test = buildTest(TestType.STANDARD, [
            buildFullSection(Section.MATH, 'math'),
            buildFullSection(Section.READING_WRITING, 'rw'),
        ]);

        getAttemptModules(test, {});

        expect(test.sections.map((section) => section.name)).toEqual([Section.MATH, Section.READING_WRITING]);
        expect(test.sections[0].modules.map((module) => module.id)).toEqual(['math-hard', 'math-1', 'math-easy']);
    });
});