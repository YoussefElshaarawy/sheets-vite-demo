/**********************************************************************
 *  main.ts – Univer.js + custom TAYLORSWIFT() formula (type‑safe)   *
 *********************************************************************/

import { createUniver, defaultTheme, LocaleType } from '@univerjs/presets';
import { UniverSheetsCorePreset }               from '@univerjs/presets/preset-sheets-core';
import enUS                                     from '@univerjs/presets/preset-sheets-core/locales/en-US';

import type {
  FormulaFunctionValueType,     // Variant wrapper  (core‑1,2,3)
  IRegisterFunction             // Proper Ministry‑approved wand
} from '@univerjs/engine-formula';

import '@univerjs/presets/lib/styles/preset-sheets-core.css';

/* ------------------------------------------------------------------ */
/* 1.  Boot‑strap a plain Univer workbook                             */
/* ------------------------------------------------------------------ */
const { univerAPI } = createUniver({
  locale: LocaleType.EN_US,
  locales: { enUS },
  theme: defaultTheme,
  presets: [UniverSheetsCorePreset({ container: 'univer' })],
});

univerAPI.createWorkbook({});

/* ------------------------------------------------------------------ */
/* 2.  Construct a Ministry‑approved wand (executor)                  */
/* ------------------------------------------------------------------ */
const LYRICS = [
  "Cause darling I'm a nightmare dressed like a daydream",
  "We're happy, free, confused and lonely at the same time",
  "You call me up again just to break me like a promise",
  "I remember it all too well",
  "Loving him was red—burning red",
];

/** Proper executor: matches IRegisterFunction */
const swiftExecutor: IRegisterFunction = (indexVariant?: FormulaFunctionValueType) => {
  /* ----- Core‑1: raw value --------------------------------------- */
  const raw = Array.isArray(indexVariant)               // range? take first cell
              ? indexVariant[0][0]?.getValue?.() ?? indexVariant[0][0]
              : (indexVariant as any)?.getValue?.() ?? indexVariant;

  /* ----- Interpret as 1‑based index ------------------------------ */
  const idx = Number(raw);
  if (idx >= 1 && idx <= LYRICS.length) return LYRICS[idx - 1];

  /* Fallback: random lyric */
  return LYRICS[Math.floor(Math.random() * LYRICS.length)];
};

/* ------------------------------------------------------------------ */
/* 3.  Register the formula with full localisation                    */
/* ------------------------------------------------------------------ */
const formulaEngine = univerAPI.getFormula();   // FFormula instance
formulaEngine.registerFunction('TAYLORSWIFT', swiftExecutor, {
  description: 'customFunction.TAYLORSWIFT.description',
  locales: {
    enUS: {
      customFunction: {
        TAYLORSWIFT: { description: 'Returns a Taylor Swift lyric. Pass 1‑5 to pick a specific line.' },
      },
    },
  },
});

/* ------------------------------------------------------------------ */
/* 4.  (Optional) Log when computing ends – proof the spell fired     */
/* ------------------------------------------------------------------ */
formulaEngine.calculationEnd(() => console.log('✨  Finite Incantatem – calculation complete!'));
