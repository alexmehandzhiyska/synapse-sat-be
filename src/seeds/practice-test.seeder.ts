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
        passage: 'A recent study found that urban trees lower nearby air temperatures by providing shade and releasing water vapor. Researchers noted that neighborhoods with more tree cover reported fewer heat-related illnesses.',
        prompt: 'Which choice best states the main idea of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'Urban trees can reduce local temperatures and the health risks that come with heat.', true],
            ['B', 'Water vapor is the only way that trees cool a city.', false],
            ['C', 'Heat-related illnesses occur only in neighborhoods without trees.', false],
            ['D', 'Researchers prefer to live in neighborhoods with many trees.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: "Critics praised the director's inventive approach, calling her use of natural light unprecedented in modern cinema.",
        prompt: 'As used in the text, "unprecedented" most nearly means',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'expensive', false],
            ['B', 'without any earlier example', true],
            ['C', 'traditional', false],
            ['D', 'confusing', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'A writer wants to emphasize that the museum is both free to enter and open late on weekends.',
        prompt: 'Which choice most effectively combines the ideas into a single sentence?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'The museum is free to enter. It is open late on weekends.', false],
            ['B', 'Free to enter, the museum also stays open late on weekends.', true],
            ['C', 'The museum, free and weekends, is late.', false],
            ['D', 'Weekends are late, and the museum is free to enter.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'Each of the volunteers ___ responsible for one section of the park.',
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
        passage: "The novel's narrator never reveals her name, and other characters address her only by her profession. This choice keeps the reader focused on her role rather than her identity.",
        prompt: 'Which statement is best supported by the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', "The narrator's anonymity emphasizes her role.", true],
            ['B', 'The narrator does not have a name at all.', false],
            ['C', 'The other characters dislike the narrator.', false],
            ['D', 'The novel has no plot to follow.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The text begins by describing the sculptor’s early failures before detailing her eventual breakthrough.',
        prompt: 'Which choice best describes the overall structure of the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'It moves from struggle to success.', true],
            ['B', 'It compares two different artists.', false],
            ['C', 'It lists the materials a sculptor uses.', false],
            ['D', 'It defines an unfamiliar term.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'After the storm passed ___ the crew inspected the boats for damage.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', ',', true],
            ['B', ';', false],
            ['C', ':', false],
            ['D', 'no punctuation', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'The article explains how honeybees communicate the location of food through a series of movements known as the waggle dance.',
        prompt: 'What is the main purpose of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'To describe how honeybees share the location of food.', true],
            ['B', 'To argue that bees are smarter than other insects.', false],
            ['C', 'To explain how honey is harvested by people.', false],
            ['D', 'To compare honeybees with ants.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The fertile valley yields more grain than any other region in the country.',
        prompt: 'As used in the text, "yields" most nearly means',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'surrenders', false],
            ['B', 'produces', true],
            ['C', 'bends', false],
            ['D', 'measures', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'The bridge was scheduled to open in May. ___ unexpected delays pushed the date to autumn.',
        prompt: 'Which choice completes the text with the most logical transition?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'However,', true],
            ['B', 'Therefore,', false],
            ['C', 'Similarly,', false],
            ['D', 'For example,', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'By the time the results were announced, the committee ___ already left.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', 'had', true],
            ['B', 'has', false],
            ['C', 'have', false],
            ['D', 'having', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'Solar panels convert sunlight directly into electricity using photovoltaic cells, which contain layers of silicon.',
        prompt: 'According to the text, what do photovoltaic cells contain?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'Layers of silicon', true],
            ['B', 'Liquid water', false],
            ['C', 'Only copper wire', false],
            ['D', 'Stored sunlight', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'Text 1 claims that homework reinforces learning. Text 2 argues that excessive homework causes stress without improving outcomes.',
        prompt: 'How does Text 2 respond to the claim in Text 1?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', 'By questioning the benefit of homework when it is excessive.', true],
            ['B', 'By agreeing with Text 1 entirely.', false],
            ['C', 'By denying that homework exists.', false],
            ['D', 'By praising longer assignments.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'The ___ uniforms were left in the locker room after the game.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', "players'", true],
            ['B', "player's", false],
            ['C', 'players', false],
            ['D', "players's", false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'The scientist described her results as ___, noting that they matched every prediction.',
        prompt: 'Which choice most logically completes the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'consistent', true],
            ['B', 'random', false],
            ['C', 'unrelated', false],
            ['D', 'doubtful', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'Although the café had no sign and sat down a narrow alley, a line formed outside it every morning.',
        prompt: 'Which statement is best supported by the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'The café was popular despite being hard to find.', true],
            ['B', 'The café advertised widely.', false],
            ['C', 'No one ever visited the café.', false],
            ['D', 'The alley outside the café was wide.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: "The author opens with a childhood memory before introducing the essay's argument about public libraries.",
        prompt: 'What is the function of the childhood memory in the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'It introduces the topic in a personal way.', true],
            ['B', 'It contradicts the essay’s argument.', false],
            ['C', 'It lists statistics about libraries.', false],
            ['D', 'It concludes the essay.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'The experiment failed twice ___ the team refused to give up.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', ', but', true],
            ['B', ',', false],
            ['C', ' but', false],
            ['D', ', so', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'A student wants to note that the festival features live music and offers local food.',
        prompt: 'Which choice most effectively combines the information?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'The festival features live music and offers local food.', true],
            ['B', 'The festival features music. The food is local.', false],
            ['C', 'Live and local, the festival music food.', false],
            ['D', 'Music and food, the festival, live.', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'Researchers restored a wetland by removing old dams, and within two years native fish populations rebounded.',
        prompt: 'Which choice best states the main idea of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'Removing the dams helped native fish recover.', true],
            ['B', 'Dams are always harmful to every species.', false],
            ['C', 'Fish cannot survive in wetlands.', false],
            ['D', 'The restoration took ten years to finish.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The new policy aims to curb wasteful spending across all departments.',
        prompt: 'As used in the text, "curb" most nearly means',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'encourage', false],
            ['B', 'restrain', true],
            ['C', 'measure', false],
            ['D', 'conceal', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: "The collection of rare coins ___ displayed in the museum's main hall.",
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
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'The recipe calls for fresh basil. ___ dried basil can be used in a pinch.',
        prompt: 'Which choice completes the text with the most logical transition?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'However,', true],
            ['B', 'Consequently,', false],
            ['C', 'Likewise,', false],
            ['D', 'Finally,', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'The map, drawn in 1502, includes coastlines that European explorers would not officially chart for another decade.',
        prompt: 'Which statement is best supported by the text?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', 'The map recorded coastlines before they were officially charted.', true],
            ['B', 'The map contained no useful information.', false],
            ['C', 'Explorers ignored the map completely.', false],
            ['D', 'The map was drawn in 1512.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The passage first defines inflation, then gives an example, and finally explains its effect on savings.',
        prompt: 'Which choice best describes the structure of the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'Definition, example, and effect', true],
            ['B', 'Problem and proposed solution', false],
            ['C', 'Two opposing points of view', false],
            ['D', 'A chronological biography', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'The company announced that ___ profits had doubled this year.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'its', true],
            ['B', "it's", false],
            ['C', "its'", false],
            ['D', 'their', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'After months of drought, the sudden rain was ___ to the farmers, who had feared losing the harvest.',
        prompt: 'Which choice most logically completes the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'a relief', true],
            ['B', 'a burden', false],
            ['C', 'an insult', false],
            ['D', 'a mystery', false],
        ],
    },
];

const readingWritingModule2: SeedQuestion[] = [
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'A study found that students who take short walks between study sessions remember more of what they learned than those who study continuously.',
        prompt: 'Which choice best states the main idea of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'Brief walks between study sessions can improve memory.', true],
            ['B', 'Walking is the only effective way to study.', false],
            ['C', 'Studying continuously is impossible.', false],
            ['D', 'Students generally dislike walking.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The engineer assured the city that the old bridge was still sound and safe to cross.',
        prompt: 'As used in the text, "sound" most nearly means',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'loud', false],
            ['B', 'sturdy', true],
            ['C', 'deep', false],
            ['D', 'sleeping', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'A writer wants to note that the app tracks sleep and suggests bedtimes.',
        prompt: 'Which choice most effectively combines the ideas?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'The app tracks sleep and suggests bedtimes.', true],
            ['B', 'The app tracks sleep. Bedtimes are suggested.', false],
            ['C', 'Sleep and bedtimes, the app tracks and suggests it.', false],
            ['D', 'The app, sleep, and bedtimes together.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'The list of ingredients ___ printed on the back of the box.',
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
        passage: 'The essay explains why coral reefs are often called the rainforests of the sea, citing their extraordinary biodiversity.',
        prompt: 'What is the main purpose of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'To explain why reefs are compared to rainforests.', true],
            ['B', 'To argue that reefs are better than rainforests.', false],
            ['C', 'To describe how coral is harvested.', false],
            ['D', 'To list ocean temperatures by region.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'Text 1 says electric cars reduce emissions. Text 2 notes that the electricity charging them may come from coal-burning plants.',
        prompt: 'How does Text 2 complicate the claim in Text 1?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', 'By pointing out that the source of the electricity matters.', true],
            ['B', 'By denying that electric cars exist.', false],
            ['C', 'By agreeing without adding anything new.', false],
            ['D', 'By praising the use of coal.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'My oldest brother ___ who lives in Denver, is visiting next week.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', ',', true],
            ['B', 'no punctuation', false],
            ['C', ';', false],
            ['D', ':', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'Migrating monarch butterflies use the position of the sun and an internal clock to navigate south each autumn.',
        prompt: 'According to the text, what helps monarchs navigate?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', "The sun's position and an internal clock", true],
            ['B', 'Ocean currents', false],
            ['C', 'Human-made maps', false],
            ['D', 'The phases of the moon alone', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: "The doctor's grave expression told the family that the news was serious.",
        prompt: 'As used in the text, "grave" most nearly means',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'buried', false],
            ['B', 'serious', true],
            ['C', 'cheerful', false],
            ['D', 'quiet', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'Tickets sold out within an hour. ___ the organizers added a second show.',
        prompt: 'Which choice completes the text with the most logical transition?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'As a result,', true],
            ['B', 'However,', false],
            ['C', 'In contrast,', false],
            ['D', 'For instance,', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'Next summer, the team ___ to compete in the national championship.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'hopes', true],
            ['B', 'hoped', false],
            ['C', 'had hoped', false],
            ['D', 'was hoping', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'The library extended its hours during finals week, and by midnight every seat was taken.',
        prompt: 'Which statement is best supported by the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'Students made heavy use of the extended hours.', true],
            ['B', 'The library was usually empty at night.', false],
            ['C', 'No one studied after dark.', false],
            ['D', 'The library closed earlier than usual.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The author interrupts the argument to acknowledge a common objection before refuting it.',
        prompt: 'What is the function of acknowledging the objection?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', 'To strengthen the argument by addressing a counterpoint.', true],
            ['B', 'To abandon the argument entirely.', false],
            ['C', 'To change the subject.', false],
            ['D', 'To repeat the introduction.', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'The ___ decision surprised everyone on the committee.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', "chairperson's", true],
            ['B', 'chairpersons', false],
            ['C', "chairpersons'", false],
            ['D', 'chairperson', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'The report was praised for being ___, covering every relevant detail without omission.',
        prompt: 'Which choice most logically completes the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'thorough', true],
            ['B', 'brief', false],
            ['C', 'careless', false],
            ['D', 'vague', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'By replacing a single traffic light with a roundabout, the town cut accidents at that intersection nearly in half.',
        prompt: 'Which choice best states the main idea of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'A roundabout reduced accidents at the intersection.', true],
            ['B', 'Traffic lights are now illegal in the town.', false],
            ['C', 'The town removed all of its roads.', false],
            ['D', 'Roundabouts always cause more accidents.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'New regulations were introduced to check the spread of the invasive weed.',
        prompt: 'As used in the text, "check" most nearly means',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'inspect', false],
            ['B', 'limit', true],
            ['C', 'pay for', false],
            ['D', 'mark off', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'For the trip we packed water, snacks ___ and a first-aid kit.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', ',', true],
            ['B', ';', false],
            ['C', ':', false],
            ['D', 'no punctuation', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'A student wants to emphasize that the telescope is portable yet powerful.',
        prompt: 'Which choice most effectively combines the ideas?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'Though portable, the telescope is remarkably powerful.', true],
            ['B', 'The telescope is portable. It is also powerful.', false],
            ['C', 'Portable and powerful the telescope is being.', false],
            ['D', 'The telescope, power and portable, is it.', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'The recipe has been passed down for five generations, its handwritten card now soft and faded from use.',
        prompt: 'Which statement is best supported by the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'The recipe has been used often over many years.', true],
            ['B', 'The recipe was written only recently.', false],
            ['C', 'No one in the family likes the recipe.', false],
            ['D', 'The card has never been touched.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The passage contrasts life in the city with life in the countryside, weighing the advantages of each.',
        prompt: 'Which choice best describes the structure of the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'A comparison of two ways of life', true],
            ['B', 'A step-by-step process', false],
            ['C', 'A single person’s biography', false],
            ['D', 'A list of historical dates', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'There ___ several reasons to postpone the launch.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'are', true],
            ['B', 'is', false],
            ['C', 'was', false],
            ['D', 'has been', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'The medicine relieved her symptoms quickly. ___ it caused mild drowsiness.',
        prompt: 'Which choice completes the text with the most logical transition?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'However,', true],
            ['B', 'Therefore,', false],
            ['C', 'Likewise,', false],
            ['D', 'Finally,', false],
        ],
    },
    {
        domain: Domain.INFORMATION_AND_IDEAS,
        passage: 'The guide lists three steps for repotting a plant: loosen the roots, add fresh soil, and water thoroughly.',
        prompt: 'What is the main purpose of the text?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', 'To explain how to repot a plant.', true],
            ['B', 'To argue that plants need no water.', false],
            ['C', 'To compare different types of soil.', false],
            ['D', 'To describe a famous garden.', false],
        ],
    },
    {
        domain: Domain.CRAFT_AND_STRUCTURE,
        passage: 'The scientist was the first to coin the term used to describe the strange new particle.',
        prompt: 'As used in the text, "coin" most nearly means',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', 'invent', true],
            ['B', 'spend', false],
            ['C', 'flip', false],
            ['D', 'collect', false],
        ],
    },
    {
        domain: Domain.STANDARD_ENGLISH_CONVENTIONS,
        passage: 'The award was shared between my partner and ___.',
        prompt: 'Which choice completes the text so that it conforms to the conventions of Standard English?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', 'me', true],
            ['B', 'I', false],
            ['C', 'myself', false],
            ['D', 'mine', false],
        ],
    },
    {
        domain: Domain.EXPRESSION_OF_IDEAS,
        passage: 'Faced with conflicting data, the researchers remained ___, refusing to draw a conclusion until more evidence arrived.',
        prompt: 'Which choice most logically completes the text?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', 'cautious', true],
            ['B', 'reckless', false],
            ['C', 'certain', false],
            ['D', 'indifferent', false],
        ],
    },
];

const mathModule1: SeedQuestion[] = [
    {
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
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 2x − 7 = 9, what is the value of x?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '1', false],
            ['B', '2', false],
            ['C', '8', true],
            ['D', '16', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 5x = 45, what is the value of x?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '5', false],
            ['B', '9', true],
            ['C', '40', false],
            ['D', '50', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'What is 20% of 150?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '15', false],
            ['B', '30', true],
            ['C', '75', false],
            ['D', '130', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'A rectangle has a length of 8 and a width of 3. What is its area?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '11', false],
            ['B', '16', false],
            ['C', '22', false],
            ['D', '24', true],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'The function f is defined by f(x) = x² + 1. What is the value of f(4)?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '9', false],
            ['B', '16', false],
            ['C', '17', true],
            ['D', '25', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'A line passes through the points (0, 2) and (1, 5). What is the slope of the line?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '2', false],
            ['B', '3', true],
            ['C', '5', false],
            ['D', '7', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'A prize of $25 is divided between two people in the ratio 2 : 3. How many dollars does the person with the larger share receive?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '5', false],
            ['B', '10', false],
            ['C', '15', true],
            ['D', '25', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'What is the area of a circle with a radius of 5?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '5π', false],
            ['B', '10π', false],
            ['C', '25π', true],
            ['D', '50π', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'If x² = 49 and x is positive, what is the value of x?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '7', true],
            ['B', '14', false],
            ['C', '24', false],
            ['D', '49', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 4(x − 2) = 12, what is the value of x?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '3', false],
            ['B', '5', true],
            ['C', '7', false],
            ['D', '10', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'What is the average (arithmetic mean) of 4, 8, and 12?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '6', false],
            ['B', '8', true],
            ['C', '12', false],
            ['D', '24', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'A triangle has a base of 10 and a height of 6. What is its area?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '16', false],
            ['B', '20', false],
            ['C', '30', true],
            ['D', '60', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'If x = 2, what is the value of x² + 3x + 2?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '8', false],
            ['B', '10', false],
            ['C', '12', true],
            ['D', '14', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 7 − 2x = 1, what is the value of x?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '3', true],
            ['B', '4', false],
            ['C', '6', false],
            ['D', '8', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'A car travels 180 miles in 3 hours at a constant speed. What is its speed, in miles per hour?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '54', false],
            ['B', '60', true],
            ['C', '90', false],
            ['D', '540', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'What is the perimeter of a square with a side length of 7?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '14', false],
            ['B', '21', false],
            ['C', '28', true],
            ['D', '49', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'What is the value of 2⁵?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '10', false],
            ['B', '25', false],
            ['C', '32', true],
            ['D', '64', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'If x ÷ 4 = 9, what is the value of x?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '5', false],
            ['B', '13', false],
            ['C', '36', true],
            ['D', '45', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: '15 is what percent of 60?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '4%', false],
            ['B', '25%', true],
            ['C', '45%', false],
            ['D', '400%', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'A right triangle has legs of length 3 and 4. What is the length of the hypotenuse?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '5', true],
            ['B', '7', false],
            ['C', '12', false],
            ['D', '25', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'If 3x² = 27 and x is positive, what is the value of x?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', '3', true],
            ['B', '6', false],
            ['C', '9', false],
            ['D', '81', false],
        ],
    },
];

const mathModule2: SeedQuestion[] = [
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 2x + 3y = 12 and y = 2, what is the value of x?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '2', false],
            ['B', '3', true],
            ['C', '6', false],
            ['D', '9', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'The function f is defined by f(x) = 2x² − 1. What is the value of f(3)?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '11', false],
            ['B', '17', true],
            ['C', '18', false],
            ['D', '35', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: '40% of what number is 20?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '8', false],
            ['B', '50', true],
            ['C', '80', false],
            ['D', '500', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'A rectangle has an area of 24 and a width of 4. What is its length?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '6', true],
            ['B', '20', false],
            ['C', '28', false],
            ['D', '96', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 5x + 2 = 3x + 10, what is the value of x?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '3', false],
            ['B', '4', true],
            ['C', '6', false],
            ['D', '8', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'What is the greatest solution to (x − 1)(x + 4) = 0?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', '−4', false],
            ['B', '1', true],
            ['C', '3', false],
            ['D', '4', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'What is the median of the numbers 3, 7, 9, 10, and 15?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '7', false],
            ['B', '9', true],
            ['C', '10', false],
            ['D', '15', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'What is the circumference of a circle with a radius of 3?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '3π', false],
            ['B', '6π', true],
            ['C', '9π', false],
            ['D', '12π', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 3(2x − 1) = 15, what is the value of x?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '2', false],
            ['B', '3', true],
            ['C', '4', false],
            ['D', '8', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'What is the value of √144?',
        difficulty: Difficulty.EASY,
        choices: [
            ['A', '12', true],
            ['B', '14', false],
            ['C', '72', false],
            ['D', '288', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'If 3 pencils cost $1.50, how much do 7 pencils cost at the same rate?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '$2.50', false],
            ['B', '$3.50', true],
            ['C', '$4.50', false],
            ['D', '$5.00', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'What is the volume of a rectangular box with dimensions 2 by 3 by 4?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '9', false],
            ['B', '20', false],
            ['C', '24', true],
            ['D', '26', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'What is the slope of the line 2x − y = 6?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', '−2', false],
            ['B', '2', true],
            ['C', '6', false],
            ['D', '−6', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'What is the greatest solution to x² − 5x + 6 = 0?',
        difficulty: Difficulty.HARD,
        choices: [
            ['A', '2', false],
            ['B', '3', true],
            ['C', '5', false],
            ['D', '6', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'A fair six-sided die is rolled once. What is the probability of rolling an even number?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '1/6', false],
            ['B', '1/3', false],
            ['C', '1/2', true],
            ['D', '2/3', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'Two angles of a triangle measure 40° and 60°. What is the measure of the third angle?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '70°', false],
            ['B', '80°', true],
            ['C', '90°', false],
            ['D', '100°', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 10 − 3x = −5, what is the value of x?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '3', false],
            ['B', '5', true],
            ['C', '−5', false],
            ['D', '15', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'If 2ˣ = 16, what is the value of x?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '2', false],
            ['B', '3', false],
            ['C', '4', true],
            ['D', '8', false],
        ],
    },
    {
        domain: Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
        prompt: 'A recipe that serves 4 requires 2 cups of flour. How many cups are needed to serve 10 at the same rate?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '4', false],
            ['B', '5', true],
            ['C', '6', false],
            ['D', '20', false],
        ],
    },
    {
        domain: Domain.GEOMETRY_AND_TRIGONOMETRY,
        prompt: 'A triangle has a base of 12 and a height of 5. What is its area?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '17', false],
            ['B', '30', true],
            ['C', '35', false],
            ['D', '60', false],
        ],
    },
    {
        domain: Domain.ALGEBRA,
        prompt: 'If 6x = 2x + 16, what is the value of x?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '2', false],
            ['B', '4', true],
            ['C', '8', false],
            ['D', '16', false],
        ],
    },
    {
        domain: Domain.ADVANCED_MATH,
        prompt: 'The function f is defined by f(x) = x³. What is the value of f(2)?',
        difficulty: Difficulty.MEDIUM,
        choices: [
            ['A', '6', false],
            ['B', '8', true],
            ['C', '9', false],
            ['D', '16', false],
        ],
    },
];

const modules: SeedModule[] = [
    { section: Section.READING_WRITING, position: 1, questions: readingWritingModule1 },
    { section: Section.READING_WRITING, position: 2, questions: readingWritingModule2 },
    { section: Section.MATH, position: 1, questions: mathModule1 },
    { section: Section.MATH, position: 2, questions: mathModule2 },
];

// `--force` removes the existing practice test and reseeds
const force = process.argv.includes('--force');

async function seedPracticeTest(): Promise<void> {
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

seedPracticeTest().catch((error: unknown) => {
    console.error('Failed to seed practice test:', error);
    process.exitCode = 1;
});
