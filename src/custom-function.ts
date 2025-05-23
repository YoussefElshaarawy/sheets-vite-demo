/*  NO external type import – keep the file self‑contained  */

const LYRICS = [
  "Cause darling I'm a nightmare dressed like a daydream",
  "We're happy, free, confused and lonely at the same time",
  "You call me up again just to break me like a promise",
  "I remember it all too well",
  "Loving him was red—burning red",
];

function taylorswift(index?: number): string {
  if (typeof index === 'number' && index >= 1 && index <= LYRICS.length) {
    return LYRICS[index - 1];
  }
  return LYRICS[Math.floor(Math.random() * LYRICS.length)];
}

/** Executor array (typed loosely to avoid missing typings) */
export const functionUser = [
  {
    namespace: 'FUN',
    name: 'TAYLORSWIFT',
    executor: taylorswift,
    volatility: true,
    parameterCount: { min: 0, max: 1 },
    descriptionKey: 'FUN.TAYLORSWIFT.description',
  },
] as any;

/** Tooltip / autocomplete strings */
export const functionEnUS = {
  'FUN.TAYLORSWIFT.description':
    'Returns a Taylor Swift lyric. Optional argument (1‑5) chooses a specific line.',
};

/** IDs to show in the Insert‑Function dialog */
export const FUNCTION_LIST_USER = ['FUN.TAYLORSWIFT'];
