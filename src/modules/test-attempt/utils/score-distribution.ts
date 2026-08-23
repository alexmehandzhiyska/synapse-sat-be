const MIN_SCORE = 400;
const MAX_SCORE = 1600;
const BUCKET_SIZE = 100;

export interface ScoreBucket {
    bucketStart: number;
    bucketEnd: number;
    count: number;
}

export interface ScoreDistribution {
    yourScore: number;
    percentile: number;
    totalAttempts: number;
    buckets: ScoreBucket[];
}

export function buildScoreDistribution(scores: number[], yourScore: number): ScoreDistribution {
    const buckets: ScoreBucket[] = [];

    for (let start = MIN_SCORE; start < MAX_SCORE; start += BUCKET_SIZE) {
        buckets.push({ bucketStart: start, bucketEnd: start + BUCKET_SIZE, count: 0 });
    }

    for (const score of scores) {
        const index = Math.min(
            buckets.length - 1,
            Math.max(0, Math.floor((score - MIN_SCORE) / BUCKET_SIZE)),
        );

        buckets[index].count += 1;
    }

    const countBelow = scores.filter((score) => score < yourScore).length;
    const percentile = Math.round((countBelow / scores.length) * 100);

    return {
        yourScore,
        percentile,
        totalAttempts: scores.length,
        buckets,
    };
}