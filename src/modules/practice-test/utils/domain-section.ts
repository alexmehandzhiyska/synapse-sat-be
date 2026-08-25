import { Domain, Section } from '../enums/practice-test.enums';

const READING_WRITING_DOMAINS: Domain[] = [
    Domain.INFORMATION_AND_IDEAS,
    Domain.CRAFT_AND_STRUCTURE,
    Domain.EXPRESSION_OF_IDEAS,
    Domain.STANDARD_ENGLISH_CONVENTIONS,
];

const MATH_DOMAINS: Domain[] = [
    Domain.ALGEBRA,
    Domain.ADVANCED_MATH,
    Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS,
    Domain.GEOMETRY_AND_TRIGONOMETRY,
];

export function getSectionForDomain(domain: Domain): Section {
    if (READING_WRITING_DOMAINS.includes(domain)) {
        return Section.READING_WRITING;
    }

    if (MATH_DOMAINS.includes(domain)) {
        return Section.MATH;
    }

    throw new Error(`Unrecognized domain: ${domain}`);
}