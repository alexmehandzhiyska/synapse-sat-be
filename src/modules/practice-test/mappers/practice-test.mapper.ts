import { resolveModuleTimeLimit } from '../constants/section-time-limits';
import { AnswerChoice } from '../entities/answer-choice.entity';
import { Module } from '../entities/module.entity';
import { PracticeTest } from '../entities/practice-test.entity';
import { Question } from '../entities/question.entity';
import { Section } from '../entities/section.entity';

function toAnswerChoiceResponse(choice: AnswerChoice) {
    return {
        id: choice.id,
        label: choice.label,
        content: choice.content,
    };
}

function toQuestionResponse(question: Question) {
    return {
        id: question.id,
        position: question.position,
        domain: question.domain,
        difficulty: question.difficulty,
        prompt: question.prompt,
        answerChoices: question.answerChoices.map(toAnswerChoiceResponse),
    };
}

function toModuleResponse(module: Module, section: Section) {
    module.section = section;

    return {
        id: module.id,
        position: module.position,
        timeLimitMinutes: resolveModuleTimeLimit(module),
        questions: module.questions.map(toQuestionResponse),
    };
}

function toSectionResponse(section: Section) {
    return {
        id: section.id,
        name: section.name,
        directions: section.directions,
        modules: section.modules.map((module) => toModuleResponse(module, section)),
    };
}

export function toFullPracticeTestResponse(test: PracticeTest) {
    return {
        id: test.id,
        title: test.title,
        type: test.type,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt,
        sections: test.sections.map(toSectionResponse),
    };
}