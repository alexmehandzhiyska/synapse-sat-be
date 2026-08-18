import { SECTION_ORDER } from '../../practice-test/constants/practice-test.constants';
import { Module } from '../../practice-test/entities/module.entity';
import { PracticeTest } from '../../practice-test/entities/practice-test.entity';
import { Question } from '../../practice-test/entities/question.entity';
import { Section as SectionEntity } from '../../practice-test/entities/section.entity';
import { Domain, Section } from '../../practice-test/enums/practice-test.enums';

type QuestionStatus = 'correct' | 'incorrect' | 'omitted';

interface AttemptAnswer {
    questionId: string;
    selectedChoiceId: string | null;
}

interface QuestionResult {
    position: number;
    status: QuestionStatus;
}

interface ModuleScore {
    position: number;
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
    totalRaw: number;
    totalScaled: number;
    sections: SectionScore[];
}

function getQuestionStatus(question: Question, answers: AttemptAnswer[]): QuestionStatus {
    const selectedChoiceId = answers.find(
        (answer) => answer.questionId === question.id,
    )?.selectedChoiceId;

    if (selectedChoiceId == null) {
        return 'omitted';
    }

    const correctChoice = question.answerChoices.find((choice) => choice.isCorrect);

    return correctChoice?.id === selectedChoiceId ? 'correct' : 'incorrect';
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

function scoreModule(module: Module, answers: AttemptAnswer[]): ModuleScore {
    const questions = [...module.questions]
        .sort((a, b) => a.position - b.position)
        .map((question) => ({
            position: question.position,
            status: getQuestionStatus(question, answers),
        }));

    return {
        position: module.position,
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

function scoreSection(section: SectionEntity, answers: AttemptAnswer[]): SectionScore {
    const orderedModules = [...section.modules].sort((a, b) => a.position - b.position);
    const modules = orderedModules.map((module) => scoreModule(module, answers));
    const questions = orderedModules.flatMap((module) => module.questions);

    const raw = modules.reduce((sum, module) => sum + module.correct, 0);
    const total = modules.reduce((sum, module) => sum + module.total, 0);

    return {
        name: section.name,
        raw,
        total,
        scaled: computeScaledScore(raw, total),
        modules,
        domains: scoreDomains(questions, answers),
    };
}

export function buildScoreReport(
    attemptId: string,
    test: PracticeTest,
    answers: AttemptAnswer[],
): ScoreReport {
    const sections = SECTION_ORDER.map((sectionName) =>
        test.sections.find((section) => section.name === sectionName),
    )
        .filter((section): section is SectionEntity => section != null)
        .map((section) => scoreSection(section, answers));

    const totalRaw = sections.reduce((sum, section) => sum + section.raw, 0);
    const totalScaled = sections.reduce((sum, section) => sum + section.scaled, 0);

    return { attemptId, totalRaw, totalScaled, sections };
}