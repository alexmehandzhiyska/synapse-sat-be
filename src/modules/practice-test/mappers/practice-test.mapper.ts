import { AnswerChoice } from '../entities/answer-choice.entity';
import { Module } from '../entities/module.entity';
import { PracticeTest } from '../entities/practice-test.entity';
import { Question } from '../entities/question.entity';
import { Section } from '../entities/section.entity';

function toAnswerChoiceResponse(choice: AnswerChoice, includeCorrectness: boolean) {
    return {
        id: choice.id,
        label: choice.label,
        content: choice.content,
        ...(includeCorrectness && { isCorrect: choice.isCorrect }),
    };
}

function toQuestionResponse(question: Question, includeCorrectness: boolean) {
    return {
        id: question.id,
        position: question.position,
        domain: question.domain,
        difficulty: question.difficulty,
        passage: question.passage,
        prompt: question.prompt,
        answerChoices: question.answerChoices.map((choice) => toAnswerChoiceResponse(choice, includeCorrectness)),
    };
}

function toModuleResponse(module: Module, section: Section, includeCorrectness: boolean) {
    module.section = section;

    return {
        id: module.id,
        position: module.position,
        questions: module.questions.map((question) => toQuestionResponse(question, includeCorrectness)),
    };
}

function toSectionResponse(section: Section, includeCorrectness: boolean) {
    return {
        id: section.id,
        name: section.name,
        directions: section.directions,
        modules: section.modules.map((module) => toModuleResponse(module, section, includeCorrectness)),
    };
}

export function toFullPracticeTestResponse(test: PracticeTest, includeCorrectness = false) {
    return {
        id: test.id,
        title: test.title,
        type: test.type,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt,
        sections: test.sections.map((section) => toSectionResponse(section, includeCorrectness)),
    };
}