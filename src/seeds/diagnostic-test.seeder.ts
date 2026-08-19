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

const TEST_TITLE = 'Diagnostic Test';

const SECTION_DIRECTIONS: Record<Section, string> = {
    [Section.READING_WRITING]: 'The questions in this section address a number of important reading and writing skills. Each question includes one or more passages, which may include a table or graph. Read each passage and question carefully, and then choose the best answer.',
    [Section.MATH]: 'The questions in this section address a number of important math skills. Read each question carefully and choose the best answer. You may use the on-screen calculator provided.',
};

// [label, content, isCorrect]
type SeedChoice = [string, string, boolean];

type SeedQuestion = {
    domain: Domain;
    passage?: string | null;
    prompt: string;
    difficulty: Difficulty;
    choices: SeedChoice[];
};

type SeedModule = {
    section: Section;
    position: number;
    questions: SeedQuestion[];
};

const readingWritingModule1: SeedQuestion[] = [
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'A coastal town rebuilt its boardwalk using recycled plastic lumber instead of wood. Officials reported that the new material resists rot and requires far less maintenance than the boardwalk it replaced.',
        prompt: 'Which choice best states the main idea of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'Recycled plastic lumber gave the town a boardwalk that lasts longer and needs less upkeep.', true],
            ['B', 'Wood boardwalks are illegal in most coastal towns.', false],
            ['C', 'The town removed its boardwalk entirely.', false],
            ['D', 'Officials disagreed about which material to use.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The engineer\'s design was praised as ingenious, solving a problem that had stumped the team for months with a single, elegant adjustment.',
        prompt: 'As used in the text, "ingenious" most nearly means',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'costly', false],
            ['B', 'cleverly inventive', true],
            ['C', 'accidental', false],
            ['D', 'ordinary', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'A student wants to note that the library extended its hours and that it now offers free printing.',
        prompt: 'Which choice most effectively combines the two ideas into a single sentence?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'The library extended its hours. Free printing is offered.', false],
            ['B', 'In addition to extending its hours, the library now offers free printing.', true],
            ['C', 'Hours and printing were both changed by the library.', false],
            ['D', 'The library, free, printing, extended its hours.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'Neither the manager nor the interns ___ aware of the schedule change.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'was', false],
            ['B', 'were', true],
            ['C', 'is', false],
            ['D', 'has been', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'The memoir describes the author\'s childhood in short, unconnected vignettes rather than a single continuous story, mirroring how memory itself surfaces in fragments.',
        prompt: 'Which statement is best supported by the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'The memoir\'s fragmented structure reflects how memory works.', true],
            ['B', 'The author forgot most of their childhood.', false],
            ['C', 'The memoir follows strict chronological order.', false],
            ['D', 'Critics disliked the memoir\'s structure.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The essay opens with a personal anecdote about a failed experiment, then broadens into a discussion of why scientific failure is undervalued.',
        prompt: 'Which choice best describes the overall structure of the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'It moves from a specific example to a general argument.', true],
            ['B', 'It presents two opposing case studies.', false],
            ['C', 'It defines a series of technical terms.', false],
            ['D', 'It summarizes a historical timeline.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'The committee reviewed the proposal ___ several members raised concerns about its cost.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', ', although', true],
            ['B', ', so', false],
            ['C', '; therefore', false],
            ['D', ', or', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'A survey of city commuters found that those who biked to work reported lower stress levels than those who drove, even after accounting for commute length.',
        prompt: 'What is the main purpose of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'To describe a link between biking to work and lower reported stress.', true],
            ['B', 'To argue that driving should be banned in cities.', false],
            ['C', 'To explain how bikes are manufactured.', false],
            ['D', 'To compare the cost of biking and driving.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'After years of decline, the factory town saw its population swell as a new industry moved in.',
        prompt: 'As used in the text, "swell" most nearly means',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'shrink', false],
            ['B', 'increase', true],
            ['C', 'complain', false],
            ['D', 'relocate', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'A researcher wants to emphasize that the trial was small and that its results should be treated cautiously.',
        prompt: 'Which choice most effectively combines the two ideas into a single sentence?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'Because the trial was small, its results should be treated cautiously.', true],
            ['B', 'The trial was small. Results should be treated cautiously.', false],
            ['C', 'Small and cautious, the trial had results.', false],
            ['D', 'Cautiously, the trial results were small.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'The recipe, which took the chef three attempts to perfect, ___ now a staple on the restaurant\'s menu.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'are', false],
            ['B', 'is', true],
            ['C', 'were', false],
            ['D', 'have been', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'The documentary avoids narration entirely, letting interview footage and archival images carry the story on their own.',
        prompt: 'Which choice best states the main idea of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'The documentary tells its story without a narrator.', true],
            ['B', 'The documentary has no interviews.', false],
            ['C', 'The documentary was poorly reviewed.', false],
            ['D', 'The documentary uses only archival images.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The critic dismissed the novel\'s ending as contrived, arguing that it resolved every conflict too neatly.',
        prompt: 'As used in the text, "contrived" most nearly means',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', 'artificially forced', true],
            ['B', 'deeply moving', false],
            ['C', 'historically accurate', false],
            ['D', 'poorly written', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'A writer wants to note that the bridge was completed in 1932 and that it remains in daily use today.',
        prompt: 'Which choice most effectively combines the two ideas into a single sentence?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'Completed in 1932, the bridge remains in daily use today.', true],
            ['B', 'The bridge was completed. It is used today.', false],
            ['C', 'In 1932 and today, the bridge.', false],
            ['D', 'Daily use, 1932, the bridge was completed.', false],
        ],
    },
];

const readingWritingModule2: SeedQuestion[] = [
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'A wildlife group reintroduced beavers to a dried-up wetland. Within two years, the beavers\' dams had restored water flow and attracted several bird species that had not been seen in the area for decades.',
        prompt: 'Which choice best states the main idea of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'Reintroducing beavers helped restore a wetland and its wildlife.', true],
            ['B', 'Beavers are difficult to reintroduce to the wild.', false],
            ['C', 'Bird species never returned to the wetland.', false],
            ['D', 'The wildlife group focused only on birds.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The panel dismissed the applicant\'s proposal as too audacious, worried that its scope exceeded the program\'s modest budget.',
        prompt: 'As used in the text, "audacious" most nearly means',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'boldly ambitious', true],
            ['B', 'poorly organized', false],
            ['C', 'inexpensive', false],
            ['D', 'familiar', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'A writer wants to state that the festival draws thousands of visitors and that most travel from out of state.',
        prompt: 'Which choice most effectively combines the two ideas into a single sentence?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'The festival draws thousands of visitors, most of whom travel from out of state.', true],
            ['B', 'The festival draws thousands. Visitors travel from out of state.', false],
            ['C', 'Thousands, out of state, the festival draws visitors.', false],
            ['D', 'Traveling, the festival draws thousands from out of state visitors.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'Each of the applicants ___ required to submit two letters of recommendation.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'is', true],
            ['B', 'are', false],
            ['C', 'were', false],
            ['D', 'have been', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'The play is staged with no set changes; a single bare room represents every location, forcing the dialogue to establish where and when each scene occurs.',
        prompt: 'Which statement is best supported by the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'The play relies on dialogue rather than staging to convey setting.', true],
            ['B', 'The play has elaborate sets for every scene.', false],
            ['C', 'The play takes place in only one location.', false],
            ['D', 'The play was poorly received by audiences.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The report first outlines the problem in general terms, then narrows to a single case study before returning to broader policy recommendations.',
        prompt: 'Which choice best describes the overall structure of the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'It moves from general, to specific, and back to general.', true],
            ['B', 'It presents a strict chronological account.', false],
            ['C', 'It compares two unrelated case studies.', false],
            ['D', 'It defines key terms before ending abruptly.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'The bakery closes early on Sundays ___ demand is lower than on other days.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', ', because', true],
            ['B', ', but', false],
            ['C', '; however', false],
            ['D', ', or', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'A study of nighttime lighting found that streets with dimmer, warmer-toned lights had similar safety records to streets with brighter, cooler-toned lights, but residents reported sleeping better.',
        prompt: 'What is the main purpose of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'To describe a finding about street lighting, safety, and sleep.', true],
            ['B', 'To argue that all streetlights should be removed.', false],
            ['C', 'To explain how streetlights are manufactured.', false],
            ['D', 'To compare the cost of two lighting systems.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The startup\'s early growth was meteoric, tripling its user base in just six months before demand leveled off.',
        prompt: 'As used in the text, "meteoric" most nearly means',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'slow and steady', false],
            ['B', 'extremely rapid', true],
            ['C', 'unpredictable', false],
            ['D', 'temporary', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'A student wants to note that the lab requires safety goggles and that gloves are also mandatory.',
        prompt: 'Which choice most effectively combines the two ideas into a single sentence?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'The lab requires both safety goggles and gloves.', true],
            ['B', 'The lab requires safety goggles. Gloves are mandatory.', false],
            ['C', 'Goggles, gloves, mandatory, the lab.', false],
            ['D', 'Mandatory in the lab, goggles are required and gloves.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'The volunteers, who arrived before dawn to set up the shelter, ___ exhausted by noon.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'was', false],
            ['B', 'were', true],
            ['C', 'is', false],
            ['D', 'has been', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'The podcast series pairs each historical event with a modern parallel, arguing that patterns from the past keep resurfacing.',
        prompt: 'Which choice best states the main idea of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'The podcast connects historical events to recurring modern patterns.', true],
            ['B', 'The podcast focuses only on ancient history.', false],
            ['C', 'The podcast has been canceled.', false],
            ['D', 'The podcast avoids discussing the present.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The architect\'s plan was called austere, stripped of ornamentation in favor of bare concrete and glass.',
        prompt: 'As used in the text, "austere" most nearly means',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', 'plain and unadorned', true],
            ['B', 'colorful and elaborate', false],
            ['C', 'expensive', false],
            ['D', 'temporary', false],
        ],
    },
];

const mathModule1: SeedQuestion[] = [
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 4x + 3 = 19, what is the value of x?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '3', false],
            ['B', '4', true],
            ['C', '5', false],
            ['D', '16', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 6x − 4 = 20, what is the value of x?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '2', false],
            ['B', '3', false],
            ['C', '4', true],
            ['D', '16', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'What is 35% of 200?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '35', false],
            ['B', '65', false],
            ['C', '70', true],
            ['D', '135', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'A triangle has a base of 10 and a height of 6. What is its area?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '16', false],
            ['B', '30', true],
            ['C', '32', false],
            ['D', '60', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'The function f is defined by f(x) = x² − 3. What is the value of f(5)?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '13', false],
            ['B', '19', false],
            ['C', '22', true],
            ['D', '25', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'A line passes through the points (0, 3) and (2, 11). What is the slope of the line?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '2', false],
            ['B', '4', true],
            ['C', '8', false],
            ['D', '11', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'A survey of 40 students found that 8 own a bicycle. What percent of the students surveyed own a bicycle?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '8%', false],
            ['B', '15%', false],
            ['C', '20%', true],
            ['D', '32%', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'A circle has a radius of 5. What is its circumference, in terms of π?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '5π', false],
            ['B', '10π', true],
            ['C', '25π', false],
            ['D', '50π', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'If x² = 49 and x < 0, what is the value of x?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '−49', false],
            ['B', '−7', true],
            ['C', '7', false],
            ['D', '49', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'A rope 42 feet long is cut into 3 pieces of equal length. What is the length, in feet, of each piece?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '12', false],
            ['B', '14', true],
            ['C', '18', false],
            ['D', '21', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'The average of five numbers is 18. If four of the numbers are 12, 15, 20, and 22, what is the fifth number?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', '19', false],
            ['B', '21', true],
            ['C', '25', false],
            ['D', '31', false],
        ],
    },
];

const mathModule2: SeedQuestion[] = [
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 7x − 2 = 26, what is the value of x?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '3', false],
            ['B', '4', true],
            ['C', '5', false],
            ['D', '24', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 2(x + 3) = 18, what is the value of x?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '3', false],
            ['B', '6', true],
            ['C', '9', false],
            ['D', '12', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'What is 15% of 240?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '24', false],
            ['B', '36', true],
            ['C', '40', false],
            ['D', '225', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'A rectangle has a perimeter of 28 and a width of 5. What is its length?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '7', false],
            ['B', '9', true],
            ['C', '18', false],
            ['D', '23', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'The function g is defined by g(x) = 2x² + 1. What is the value of g(3)?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '7', false],
            ['B', '13', false],
            ['C', '19', true],
            ['D', '37', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'A line passes through the points (1, 2) and (4, 14). What is the slope of the line?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '3', false],
            ['B', '4', true],
            ['C', '6', false],
            ['D', '12', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'A jar contains 60 marbles, of which 24 are blue. What is the ratio of blue marbles to non-blue marbles?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '2 to 3', true],
            ['B', '3 to 2', false],
            ['C', '2 to 5', false],
            ['D', '3 to 5', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'A right triangle has legs of length 6 and 8. What is the length of its hypotenuse?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '9', false],
            ['B', '10', true],
            ['C', '12', false],
            ['D', '14', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'If x² = 81 and x > 0, what is the value of x?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '8', false],
            ['B', '9', true],
            ['C', '40.5', false],
            ['D', '81', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'A ribbon 54 inches long is cut into 6 pieces of equal length. What is the length, in inches, of each piece?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '6', false],
            ['B', '8', false],
            ['C', '9', true],
            ['D', '12', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'The average of four numbers is 25. If three of the numbers are 18, 24, and 30, what is the fourth number?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', '24', false],
            ['B', '26', false],
            ['C', '28', true],
            ['D', '30', false],
        ],
    },
];

const modules: SeedModule[] = [
    { section: Section.READING_WRITING, position: 1, questions: readingWritingModule1 },
    { section: Section.READING_WRITING, position: 2, questions: readingWritingModule2 },
    { section: Section.MATH, position: 1, questions: mathModule1 },
    { section: Section.MATH, position: 2, questions: mathModule2 },
];

// `--force` removes the existing diagnostic test and reseeds
const force = process.argv.includes('--force');

async function seedDiagnosticTest(): Promise<void> {
    await dataSource.initialize();

    try {
        await dataSource.transaction(async (manager) => {
            const existingTest = await manager.findOne(PracticeTest, {
                where: { title: TEST_TITLE },
            });

            if (existingTest) {
                if (!force) {
                    console.log(`${TEST_TITLE} already exists; skipping seed.`);
                    return;
                }

                await manager.delete(PracticeTest, { id: existingTest.id });
                console.log(`Removed existing ${TEST_TITLE} before reseeding.`);
            }

            const practiceTest = await manager.save(
                manager.create(PracticeTest, {
                    title: TEST_TITLE,
                    type: TestType.DIAGNOSTIC,
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

                for (const [questionIndex, questionData] of moduleData.questions.entries()) {
                    const question = await manager.save(
                        manager.create(Question, {
                            moduleId: module.id,
                            section: moduleData.section,
                            domain: questionData.domain,
                            passage: questionData.passage ?? null,
                            prompt: questionData.prompt,
                            difficulty: questionData.difficulty,
                            position: questionIndex + 1,
                        }),
                    );

                    const answerChoices = questionData.choices.map(
                        ([label, content, isCorrect]) =>
                            manager.create(AnswerChoice, {
                                questionId: question.id,
                                label,
                                content,
                                isCorrect,
                            }),
                    );

                    await manager.save(AnswerChoice, answerChoices);
                }
            }

            console.log(`${TEST_TITLE} seeded successfully.`);
        });
    } finally {
        await dataSource.destroy();
    }
}

seedDiagnosticTest().catch((error: unknown) => {
    console.error('Failed to seed diagnostic test:', error);
    process.exitCode = 1;
});