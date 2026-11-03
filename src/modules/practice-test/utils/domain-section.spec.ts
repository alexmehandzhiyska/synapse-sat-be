import { Domain, Section } from '../enums/practice-test.enums';

import { getSectionForDomain } from './domain-section';

describe('getSectionForDomain', () => {
    it('returns reading & writing for reading & writing domains', () => {
        expect(getSectionForDomain(Domain.INFORMATION_AND_IDEAS)).toBe(Section.READING_WRITING);
        expect(getSectionForDomain(Domain.CRAFT_AND_STRUCTURE)).toBe(Section.READING_WRITING);
        expect(getSectionForDomain(Domain.EXPRESSION_OF_IDEAS)).toBe(Section.READING_WRITING);
        expect(getSectionForDomain(Domain.STANDARD_ENGLISH_CONVENTIONS)).toBe(Section.READING_WRITING);
    });

    it('returns math for math domains', () => {
        expect(getSectionForDomain(Domain.ALGEBRA)).toBe(Section.MATH);
        expect(getSectionForDomain(Domain.ADVANCED_MATH)).toBe(Section.MATH);
        expect(getSectionForDomain(Domain.PROBLEM_SOLVING_AND_DATA_ANALYSIS)).toBe(Section.MATH);
        expect(getSectionForDomain(Domain.GEOMETRY_AND_TRIGONOMETRY)).toBe(Section.MATH);
    });

    it('maps every domain to a section', () => {
        for (const domain of Object.values(Domain)) {
            expect(() => getSectionForDomain(domain)).not.toThrow();
        }
    });

    it('throws for an unrecognized domain', () => {
        expect(() => getSectionForDomain('unknown' as Domain)).toThrow('Unrecognized domain: unknown');
    });
});