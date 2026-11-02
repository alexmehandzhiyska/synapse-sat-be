import { Domain } from '../../practice-test/enums/practice-test.enums';

import {
    computeDaysRemaining,
    computeTargetAccuracy,
    estimateDaysForDomain,
    pickRecommendedDomains,
} from './sequencing';

describe('computeTargetAccuracy', () => {
    it('returns 0 for the minimum score of 400', () => {
        expect(computeTargetAccuracy(400)).toBe(0);
    });

    it('returns 1 for the maximum score of 1600', () => {
        expect(computeTargetAccuracy(1600)).toBe(1);
    });

    it('returns the per-section accuracy needed for the goal score', () => {
        expect(computeTargetAccuracy(1000)).toBe(0.5);
        expect(computeTargetAccuracy(1300)).toBe(0.75);
    });
});

describe('computeDaysRemaining', () => {
    beforeEach(() => {
        jest.useFakeTimers({ now: new Date(2026, 10, 2, 15, 30) });
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('counts whole days until the test date, ignoring the time of day', () => {
        expect(computeDaysRemaining('2026-11-12')).toBe(10);
    });

    it('returns 0 when the test is today', () => {
        expect(computeDaysRemaining('2026-11-02')).toBe(0);
    });

    it('returns a negative number when the test date has passed', () => {
        expect(computeDaysRemaining('2026-10-30')).toBe(-3);
    });

    it('counts across month and year boundaries', () => {
        expect(computeDaysRemaining('2027-01-01')).toBe(60);
    });
});

describe('estimateDaysForDomain', () => {
    it('counts one day per lesson', () => {
        expect(estimateDaysForDomain(4, false)).toBe(4);
    });

    it('adds one day for a check-in', () => {
        expect(estimateDaysForDomain(4, true)).toBe(5);
    });

    it('returns 0 for a domain with no lessons and no check-in', () => {
        expect(estimateDaysForDomain(0, false)).toBe(0);
    });
});

describe('pickRecommendedDomains', () => {
    const domains = [Domain.ALGEBRA, Domain.GEOMETRY_AND_TRIGONOMETRY, Domain.ADVANCED_MATH];

    const costs: Record<string, number> = {
        [Domain.ALGEBRA]: 4,
        [Domain.GEOMETRY_AND_TRIGONOMETRY]: 3,
        [Domain.ADVANCED_MATH]: 1,
    };

    const estimateDays = (domain: Domain) => costs[domain];
    const allNeedWork = () => true;
    const noneNeedWork = () => false;

    it('includes every domain when the budget fits them all', () => {
        const result = pickRecommendedDomains(domains, estimateDays, 8, allNeedWork);

        expect([...result]).toEqual(domains);
    });

    it('keeps the priority order of the domains', () => {
        const reversed = [...domains].reverse();
        const result = pickRecommendedDomains(reversed, estimateDays, 8, allNeedWork);

        expect([...result]).toEqual(reversed);
    });

    it('stops at the first domain that does not fit the remaining budget', () => {
        const result = pickRecommendedDomains(domains, estimateDays, 6, allNeedWork);

        expect([...result]).toEqual([Domain.ALGEBRA]);
    });

    it('includes a domain that uses up exactly the remaining budget', () => {
        const result = pickRecommendedDomains(domains, estimateDays, 7, allNeedWork);

        expect([...result]).toEqual([Domain.ALGEBRA, Domain.GEOMETRY_AND_TRIGONOMETRY]);
    });

    it('skips domains that do not need work', () => {
        const needsWork = (domain: Domain) => domain !== Domain.GEOMETRY_AND_TRIGONOMETRY;
        const result = pickRecommendedDomains(domains, estimateDays, 8, needsWork);

        expect([...result]).toEqual([Domain.ALGEBRA, Domain.ADVANCED_MATH]);
    });

    it('falls back to every domain when none need work', () => {
        const result = pickRecommendedDomains(domains, estimateDays, 8, noneNeedWork);

        expect([...result]).toEqual(domains);
    });

    it('always includes the first domain, even when it does not fit the budget', () => {
        const result = pickRecommendedDomains(domains, estimateDays, 2, allNeedWork);

        expect([...result]).toEqual([Domain.ALGEBRA]);
    });

    it('treats a test date in the past as a budget of 0', () => {
        const freeDomain = () => 0;
        const result = pickRecommendedDomains(domains, freeDomain, -5, allNeedWork);

        expect([...result]).toEqual(domains);
    });

    it('returns an empty set when there are no domains', () => {
        const result = pickRecommendedDomains([], estimateDays, 8, allNeedWork);

        expect(result.size).toBe(0);
    });
});