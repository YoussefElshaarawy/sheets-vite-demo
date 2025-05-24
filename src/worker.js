// src/worker.js
import {
  AutoTokenizer,
  AutoModelForCausalLM,
  TextStreamer,
  InterruptableStoppingCriteria,
} from '@huggingface/transformers';

const stopping_criteria = new InterruptableStoppingCriteria();

let past_key_values_cache = null;
async function generate(messages) {
  const tokenizer = await AutoTokenizer.from_pretrained('HuggingFaceTB/SmolLM2-1.7B-Instruct');
  const model = await AutoModelForCausalLM.from_pretrained('HuggingFaceTB/SmolLM2-1.7B-Instruct', {
    quantized: true,
    device: 'webgpu',
  });

  const inputs = tokenizer.apply_chat_template(messages, {
    add_generation_prompt: true,
    return_dict: true,
  });

  let startTime;
  let numTokens = 0;
  let tps;
  const token_callback_function = () => {
    startTime ??= performance.now();
    if (numTokens++ > 0) {
      tps = (numTokens / (performance.now() - startTime)) * 1000;
    }
  };
  const callback_function = (output) => {
    self.postMessage({
      status: 'update',
      output,
      tps,
      numTokens,
    });
  };

  const streamer = new TextStreamer(tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function,
    token_callback_function,
  });

  self.postMessage({ status: 'start' });

  const { past_key_values, sequences } = await model.generate({
    ...inputs,
    past_key_values: past_key_values_cache,
    max_new_tokens: 1024,
    streamer,
    stopping_criteria,
    return_dict_in_generate: true,
  });

  past_key_values_cache = past_key_values;

  self.postMessage({ status: 'complete' });
}

self.addEventListener('message', async (e) => {
  const { type, data } = e.data;
  switch (type) {
    case 'check':
      self.postMessage({ status: 'ready' });
      break;
    case 'load':
      self.postMessage({ status: 'loading', data: 'Model is being loaded...' });
      break;
    case 'generate':
      stopping_criteria.reset();
      generate(data);
      break;
    case 'interrupt':
      stopping_criteria.interrupt();
      break;
    case 'reset':
      past_key_values_cache = null;
      stopping_criteria.reset();
      break;
  }
});
