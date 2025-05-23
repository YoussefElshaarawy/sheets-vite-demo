import { pipeline } from '@xenova/transformers';

// We prepare the SmolLM2 “brew” only once
export const llmPipeline = pipeline(
  'text-generation',
  'HuggingFaceTB/SmolLM2-1.7B-Instruct',
  { quantized: true }
);
