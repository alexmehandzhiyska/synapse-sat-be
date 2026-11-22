export enum TestType {
    DIAGNOSTIC = 'diagnostic',
    STANDARD = 'standard',
    CHECK_IN = 'check_in',
    CUSTOM = 'custom',
}

export enum QuestionStatusFilter {
    CORRECT = 'correct',
    INCORRECT = 'incorrect',
    UNSOLVED = 'unsolved',
}

export enum Section {
    READING_WRITING = 'reading_writing',
    MATH = 'math',
}

export enum Difficulty {
    EASY = 'easy',
    MEDIUM = 'medium',
    HARD = 'hard',
}

// Which version of module 2 a full test serves based on how the student did on module 1
export enum ModuleVariant {
    EASY = 'easy',
    HARD = 'hard',
}

export enum Domain {
    INFORMATION_AND_IDEAS = 'information_and_ideas',
    CRAFT_AND_STRUCTURE = 'craft_and_structure',
    EXPRESSION_OF_IDEAS = 'expression_of_ideas',
    STANDARD_ENGLISH_CONVENTIONS = 'standard_english_conventions',

    ALGEBRA = 'algebra',
    ADVANCED_MATH = 'advanced_math',
    PROBLEM_SOLVING_AND_DATA_ANALYSIS = 'problem_solving_and_data_analysis',
    GEOMETRY_AND_TRIGONOMETRY = 'geometry_and_trigonometry',
}