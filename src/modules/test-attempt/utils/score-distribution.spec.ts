import { buildScoreDistribution } from './score-distribution';

const countFor = (scores: number[], bucketStart: number): number => buildScoreDistribution(scores, scores[0]).buckets.find((bucket) => bucket.bucketStart === bucketStart)!.count;

describe('buildScoreDistribution', () => {
    describe('buckets', () => {
        it('splits the 400-1600 range into 100-point buckets', () => {
            const { buckets } = buildScoreDistribution([1000], 1000);

            expect(buckets).toHaveLength(12);
            expect(buckets[0]).toEqual({ bucketStart: 400, bucketEnd: 500, count: 0 });
            expect(buckets[11]).toEqual({ bucketStart: 1500, bucketEnd: 1600, count: 0 });
        });

        it('counts each score in the bucket it falls into', () => {
            const { buckets } = buildScoreDistribution([1000, 1050, 1200], 1000);

            expect(buckets.map((bucket) => bucket.count)).toEqual([0, 0, 0, 0, 0, 0, 2, 0, 1, 0, 0, 0]);
        });

        it('puts a score on a bucket boundary into the higher bucket', () => {
            expect(countFor([500], 400)).toBe(0);
            expect(countFor([500], 500)).toBe(1);
        });

        it('puts a perfect 1600 into the last bucket', () => {
            expect(countFor([1600], 1500)).toBe(1);
        });

        it('puts scores below 400 into the first bucket', () => {
            // Single-section tests can score as low as 200
            expect(countFor([200], 400)).toBe(1);
        });
    });

    describe('percentile', () => {
        it('is the share of scores strictly below your score', () => {
            const { percentile } = buildScoreDistribution([800, 900, 1000, 1100], 1000);

            expect(percentile).toBe(50);
        });

        it('does not count scores equal to yours', () => {
            const { percentile } = buildScoreDistribution([1000, 1000, 1000, 1200], 1000);

            expect(percentile).toBe(0);
        });

        it('is 0 when you are the only attempt', () => {
            const { percentile } = buildScoreDistribution([1000], 1000);

            expect(percentile).toBe(0);
        });

        it('rounds to the nearest whole number', () => {
            expect(buildScoreDistribution([800, 1000, 1200], 1000).percentile).toBe(33);
            expect(buildScoreDistribution([800, 1000, 1200], 1200).percentile).toBe(67);
        });
    });

    it('returns your score and the total number of attempts', () => {
        const distribution = buildScoreDistribution([800, 1000, 1200], 1000);

        expect(distribution).toMatchObject({ yourScore: 1000, totalAttempts: 3 });
    });
});