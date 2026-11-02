import { Domain } from '../../practice-test/enums/practice-test.enums';

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const DAYS_PER_LESSON = 1;
const DAYS_PER_CHECK_IN = 1;

// Accuracy needed per section in order to achieve goal score
export function computeTargetAccuracy(goalScore: number): number {
    const targetSectionScore = goalScore / 2;
    const targetSectionAccuracy = (targetSectionScore - 200) / 600;

    return targetSectionAccuracy;
}

export function computeDaysRemaining(testDate: string): number {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const testDay = new Date(`${testDate}T00:00:00`);

    const millisecondsRemaining = testDay.getTime() - today.getTime();

    return Math.round(millisecondsRemaining / MS_PER_DAY);
}

// Pacing is approximated from lesson/check-in count.
export function estimateDaysForDomain(lessonCount: number, hasCheckIn: boolean): number {
    return lessonCount * DAYS_PER_LESSON + (hasCheckIn ? DAYS_PER_CHECK_IN : 0);
}

// Pick domains in priority order until student runs out of time, skipping any that are
// already at or above target.
export function pickRecommendedDomains(
    orderedDomains: Domain[],
    estimateDays: (domain: Domain) => number,
    daysRemaining: number,
    needsWork: (domain: Domain) => boolean
): Set<Domain> {
    const priorityDomains = orderedDomains.filter(needsWork);
    const candidateDomains = priorityDomains.length > 0 ? priorityDomains : orderedDomains;

    const recommendedDomains = new Set<Domain>();
    let remainingBudget = Math.max(0, daysRemaining);

    for (const domain of candidateDomains) {
        const cost = estimateDays(domain);

        if (recommendedDomains.size > 0 && cost > remainingBudget) {
            break;
        }
        
        recommendedDomains.add(domain);
        remainingBudget -= cost;
    }

    return recommendedDomains;
}