import { SECTION_ORDER } from '../../practice-test/constants/practice-test.constants';
import { Module } from '../../practice-test/entities/module.entity';
import { PracticeTest } from '../../practice-test/entities/practice-test.entity';
import { Question } from '../../practice-test/entities/question.entity';
import { Section as SectionEntity } from '../../practice-test/entities/section.entity';
import { Difficulty, Domain, ModuleVariant, Section, TestType } from '../../practice-test/enums/practice-test.enums';

import { getAttemptModules, isAdaptiveTest, ModuleRoutes } from './attempt-modules';

// Harder questions count for more in adaptive tests, so the easy route can't reach the top scores
const DIFFICULTY_WEIGHTS: Record<Difficulty, number> = {
    [Difficulty.EASY]: 1,
    [Difficulty.MEDIUM]: 2,
    [Difficulty.HARD]: 3,
};

type QuestionStatus = 'correct' | 'incorrect' | 'omitted';

interface AttemptAnswer {
    questionId: string;
    selectedChoiceId: string | null;
}

interface AnswerChoiceResult {
    id: string;
    label: string;
    content: string;
    isCorrect: boolean;
}

interface QuestionResult {
    id: string;
    position: number;
    status: QuestionStatus;
    domain: Domain;
    difficulty: Difficulty;
    passage: string | null;
    prompt: string;
    selectedChoiceId: string | null;
    answerChoices: AnswerChoiceResult[];
}

interface ModuleScore {
    position: number;
    variant: ModuleVariant | null;
    correct: number;
    incorrect: number;
    omitted: number;
    total: number;
    questions: QuestionResult[];
}

interface DomainScore {
    domain: Domain;
    correct: number;
    total: number;
}

interface SectionScore {
    name: Section;
    raw: number;
    total: number;
    scaled: number;
    modules: ModuleScore[];
    domains: DomainScore[];
}

export interface ScoreReport {
    attemptId: string;
    isDiagnostic: boolean;
    isCustom: boolean;
    totalRaw: number;
    totalScaled: number;
    sections: SectionScore[];
}

function getSelectedChoiceId(question: Question, answers: AttemptAnswer[]): string | null {
    return answers.find((answer) => answer.questionId === question.id)?.selectedChoiceId ?? null;
}

function getQuestionStatus(question: Question, answers: AttemptAnswer[]): QuestionStatus {
    const selectedChoiceId = getSelectedChoiceId(question, answers);

    if (selectedChoiceId == null) {
        return 'omitted';
    }

    const correctChoice = question.answerChoices.find((choice) => choice.isCorrect);

    return correctChoice?.id === selectedChoiceId ? 'correct' : 'incorrect';
}

function buildQuestionResult(question: Question, answers: AttemptAnswer[]): QuestionResult {
    return {
        id: question.id,
        position: question.position,
        status: getQuestionStatus(question, answers),
        domain: question.domain,
        difficulty: question.difficulty,
        passage: question.passage,
        prompt: question.prompt,
        selectedChoiceId: getSelectedChoiceId(question, answers),
        answerChoices: [...question.answerChoices]
            .sort((a, b) => a.label.localeCompare(b.label))
            .map((choice) => ({
                id: choice.id,
                label: choice.label,
                content: choice.content,
                isCorrect: choice.isCorrect,
            })),
    };
}

// Maps a section's raw score onto the SAT's 200-800 scale, rounded to the
// nearest 10 (as it is on the real test).
function computeScaledScore(correct: number, total: number): number {
    if (total === 0) {
        return 200;
    }

    const scaled = 200 + (correct / total) * 600;

    return Math.min(800, Math.max(200, Math.round(scaled / 10) * 10));
}

export function scoreModule(module: Module, answers: AttemptAnswer[]): ModuleScore {
    const questions = [...module.questions]
        .sort((a, b) => a.position - b.position)
        .map((question) => buildQuestionResult(question, answers));

    return {
        position: module.position,
        variant: module.variant,
        correct: questions.filter((question) => question.status === 'correct').length,
        incorrect: questions.filter((question) => question.status === 'incorrect').length,
        omitted: questions.filter((question) => question.status === 'omitted').length,
        total: questions.length,
        questions,
    };
}

function scoreDomains(questions: Question[], answers: AttemptAnswer[]): DomainScore[] {
    const domainTotals = new Map<Domain, DomainScore>();

    for (const question of questions) {
        let domainScore = domainTotals.get(question.domain);

        if (!domainScore) {
            domainScore = { domain: question.domain, correct: 0, total: 0 };
            domainTotals.set(question.domain, domainScore);
        }

        domainScore.total += 1;

        if (getQuestionStatus(question, answers) === 'correct') {
            domainScore.correct += 1;
        }
    }

    return [...domainTotals.values()];
}

function getTotalWeight(questions: Question[]): number {
    return questions.reduce((sum, question) => sum + DIFFICULTY_WEIGHTS[question.difficulty], 0);
}

// Highest weighted score possible: module 1 plus the heavier module 2 (the hard route)
function getMaxSectionWeight(section: SectionEntity): number {
    const module1Weight = getTotalWeight(
        section.modules.filter((module) => module.position === 1).flatMap((module) => module.questions),
    );
    
    // The highest weighted score possible in a section: module 1 plus the heavier module 2 
    // (normally the hard one, but a teacher may not have filled it in yet or made a mistake)
    const module2Weights = section.modules
        .filter((module) => module.position === 2)
        .map((module) => getTotalWeight(module.questions));

    return module1Weight + Math.max(...module2Weights);
}

function scoreSection(
    section: SectionEntity,
    modulesTaken: Module[],
    answers: AttemptAnswer[],
    isAdaptive: boolean,
): SectionScore {
    const modules = modulesTaken.map((module) => scoreModule(module, answers));
    const questions = modulesTaken.flatMap((module) => module.questions);

    const raw = modules.reduce((sum, module) => sum + module.correct, 0);
    const total = modules.reduce((sum, module) => sum + module.total, 0);

    const correctQuestions = questions.filter((question) => getQuestionStatus(question, answers) === 'correct');
    const scaled = isAdaptive
        ? computeScaledScore(getTotalWeight(correctQuestions), getMaxSectionWeight(section))
        : computeScaledScore(raw, total);

    return {
        name: section.name,
        raw,
        total,
        scaled,
        modules,
        domains: scoreDomains(questions, answers),
    };
}

export function buildScoreReport(
    attemptId: string,
    test: PracticeTest,
    answers: AttemptAnswer[],
    moduleRoutes: ModuleRoutes,
): ScoreReport {
    const attemptModules = getAttemptModules(test, moduleRoutes);

    const sections = SECTION_ORDER.map((sectionName) =>
        test.sections.find((section) => section.name === sectionName),
    )
        .filter((section): section is SectionEntity => section != null)
        .map((section) =>
            scoreSection(
                section,
                attemptModules
                    .filter((moduleWithSection) => moduleWithSection.sectionName === section.name)
                    .map((moduleWithSection) => moduleWithSection.module),
                answers,
                isAdaptiveTest(test),
            ),
        );

    const totalRaw = sections.reduce((sum, section) => sum + section.raw, 0);
    const totalScaled = sections.reduce((sum, section) => sum + section.scaled, 0);

    return {
        attemptId,
        isDiagnostic: test.type === TestType.DIAGNOSTIC,
        isCustom: test.type === TestType.CUSTOM,
        totalRaw,
        totalScaled,
        sections,
    };
}