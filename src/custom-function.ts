import type { IFunctionInfo } from '@univerjs/engine-formula';

/* ------------------------------------------------------------ */
/*  Your lyric bank                                             */
/* ------------------------------------------------------------ */
const LYRICS = [
  "Cause darling I'm a nightmare dressed like a daydream",
  "We're happy, free, confused and lonely at the same time",
  "You call me up again just to break me like a promise",
  "I remember it all too well",
  "Loving him was red—burning red",
];

/* ------------------------------------------------------------ */
/*  Executor                                                    */
/* ------------------------------------------------------------ */
function taylorswift(index?: number): string {
  if (typeof index === 'number' && index >= 1 && index <= LYRICS.length) {
    return LYRICS[index - 1];
  }
  return LYRICS[Math.floor(Math.random() * LYRICS.length)];
}

/* ------------------------------------------------------------ */
/*  Registration objects                                        */
/* ------------------------------------------------------------ */
export const functionUser: IFunctionInfo[] = [
  {
    namespace: 'FUN',
    name: 'TAYLORSWIFT',
    executor: taylorswift,
    volatility: true,                 // recalc each time the sheet recalcs
    parameterCount: { min: 0, max: 1 },
    descriptionKey: 'FUN.TAYLORSWIFT.description',
  },
];

export const functionEnUS = {
  'FUN.TAYLORSWIFT.description':
    'Returns a Taylor Swift lyric. Optional argument (1‑5) chooses a specific line.',
};

export const FUNCTION_LIST_USER = ['FUN.TAYLORSWIFT'];
