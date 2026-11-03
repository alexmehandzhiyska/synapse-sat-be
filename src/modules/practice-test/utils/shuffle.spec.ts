import { shuffle } from './shuffle';

describe('shuffle', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('returns the same items', () => {
        const result = shuffle([1, 2, 3, 4, 5]);

        expect([...result].sort()).toEqual([1, 2, 3, 4, 5]);
    });

    it('does not mutate the original array', () => {
        const items = [1, 2, 3, 4];
        jest.spyOn(Math, 'random').mockReturnValue(0);

        const result = shuffle(items);

        expect(items).toEqual([1, 2, 3, 4]);
        expect(result).not.toBe(items);
    });

    it('swaps items based on Math.random', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0);

        expect(shuffle([1, 2, 3, 4])).toEqual([2, 3, 4, 1]);
    });

    it('keeps the order when every item swaps with itself', () => {
        jest.spyOn(Math, 'random').mockReturnValue(0.99);

        expect(shuffle([1, 2, 3, 4])).toEqual([1, 2, 3, 4]);
    });

    it('returns an empty array for an empty input', () => {
        expect(shuffle([])).toEqual([]);
    });

    it('returns a single item unchanged', () => {
        expect(shuffle(['only'])).toEqual(['only']);
    });
});