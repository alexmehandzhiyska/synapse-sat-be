import 'reflect-metadata';

import dataSource from '../config/typeorm.config';
import { AnswerChoice } from '../modules/practice-test/entities/answer-choice.entity';
import { Module } from '../modules/practice-test/entities/module.entity';
import { PracticeTest } from '../modules/practice-test/entities/practice-test.entity';
import { Question } from '../modules/practice-test/entities/question.entity';
import { Section as SectionEntity } from '../modules/practice-test/entities/section.entity';
import {
    Difficulty,
    Domain,
    Section,
    TestType,
} from '../modules/practice-test/enums/practice-test.enums';

const TEST_TITLE = 'Practice Test 1';

const SECTION_DIRECTIONS: Record<Section, string> = {
    [Section.READING_WRITING]: 'The questions in this section address a number of important reading and writing skills. Each question includes one or more passages, which may include a table or graph. Read each passage and question carefully, and then choose the best answer.',
    [Section.MATH]: 'The questions in this section address a number of important math skills. Read each question carefully and choose the best answer. You may use the on-screen calculator provided.',
};

type SeedModule = {
    section: Section;
    position: number;
    question: {
        domain: Domain;
        passage?: string;
        prompt: string;
        difficulty: Difficulty;
        choices: readonly (readonly [string, string, boolean])[];
    };
};

const modules: readonly SeedModule[] = [
    {
        section: Section.READING_WRITING,
        position: 1,
        question: {
            domain: Domain.INFORMATION_AND_IDEAS,
            passage: 'Marine biologist Ayana Johnson studies the role of kelp forests in coastal ecosystems. In a recent study, she found that these underwater forests not only shelter a wide range of species but also absorb significant amounts of carbon dioxide from the surrounding water. Johnson argues that protecting kelp forests should therefore be a central goal of climate policy, not merely an afterthought.',
            prompt: 'Which choice best states the main idea of the text?',
            difficulty: Difficulty.EASY,
            choices: [
                ['A', "It introduces the passage's central claim.", true],
                ['B', 'It provides an unrelated historical detail.', false],
                ['C', "It contradicts the author's conclusion.", false],
                ['D', 'It defines a term that is never used again.', false],
            ],
        },
    },
    {
        section: Section.READING_WRITING,
        position: 2,
        question: {
            domain: Domain.CRAFT_AND_STRUCTURE,
            passage:
                'When the composer first performed the piece, critics were unsure what to make of it. Its structure abandoned the familiar patterns of the era, weaving together folk melodies and dissonant harmonies in a way audiences had never encountered. One reviewer called the approach entirely novel, unlike anything the concert hall had hosted before.',
            prompt:
                'As used in the text, what does the word "novel" most nearly mean?',
            difficulty: Difficulty.MEDIUM,
            choices: [
                ['A', 'Lengthy', false],
                ['B', 'Fictional', false],
                ['C', 'New or original', true],
                ['D', 'Complicated', false],
            ],
        },
    },
    {
        section: Section.MATH,
        position: 1,
        question: {
            domain: Domain.ALGEBRA,
            prompt: 'If 3x + 5 = 20, what is the value of x?',
            difficulty: Difficulty.EASY,
            choices: [
                ['A', '3', false],
                ['B', '5', true],
                ['C', '8', false],
                ['D', '15', false],
            ],
        },
    },
    {
        section: Section.MATH,
        position: 2,
        question: {
            domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
            prompt: 'A rectangle has length 8 and width 3. What is its area?',
            difficulty: Difficulty.EASY,
            choices: [
                ['A', '11', false],
                ['B', '16', false],
                ['C', '22', false],
                ['D', '24', true],
            ],
        },
    },
] as const;

async function seedPracticeTest(): Promise<void> {
    await dataSource.initialize();

    try {
        await dataSource.transaction(async (manager) => {
            const existingTest = await manager.findOne(PracticeTest, {
                where: { title: TEST_TITLE },
            });

            if (existingTest) {
                console.log(`${TEST_TITLE} already exists; skipping seed.`);
                return;
            }

            const practiceTest = await manager.save(
                manager.create(PracticeTest, {
                    title: TEST_TITLE,
                    type: TestType.STANDARD,
                }),
            );

            const sectionsByName = new Map<Section, SectionEntity>();

            for (const moduleData of modules) {
                let section = sectionsByName.get(moduleData.section);

                if (!section) {
                    section = await manager.save(
                        manager.create(SectionEntity, {
                            testId: practiceTest.id,
                            name: moduleData.section,
                            directions: SECTION_DIRECTIONS[moduleData.section],
                        }),
                    );
                    sectionsByName.set(moduleData.section, section);
                }

                const module = await manager.save(
                    manager.create(Module, {
                        sectionId: section.id,
                        position: moduleData.position,
                    }),
                );

                const question = await manager.save(
                    manager.create(Question, {
                        moduleId: module.id,
                        section: moduleData.section,
                        domain: moduleData.question.domain,
                        passage: moduleData.question.passage,
                        prompt: moduleData.question.prompt,
                        difficulty: moduleData.question.difficulty,
                        position: 1,
                    }),
                );

                const answerChoices: AnswerChoice[] = [];

                for (const [label, content, isCorrect] of moduleData.question.choices) {
                    answerChoices.push(
                        manager.create(AnswerChoice, {
                            questionId: question.id,
                            label,
                            content,
                            isCorrect,
                        }),
                    );
                }

                await manager.save(AnswerChoice, answerChoices);
            }

            console.log(`${TEST_TITLE} seeded successfully.`);
        });
    } finally {
        await dataSource.destroy();
    }
}

seedPracticeTest().catch((error: unknown) => {
    console.error('Failed to seed practice test:', error);
    process.exitCode = 1;
});
