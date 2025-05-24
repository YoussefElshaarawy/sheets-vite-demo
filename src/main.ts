const loadBtn = document.getElementById('loadBtn') as HTMLButtonElement;
const genBtn = document.getElementById('generateBtn') as HTMLButtonElement;
const status = document.getElementById('status')!;
const promptInput = document.getElementById('prompt') as HTMLTextAreaElement;
const output = document.getElementById('output')!;

const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
});

worker.postMessage({ type: 'check' });

worker.addEventListener('message', (e) => {
  const msg = e.data;
  switch (msg.status) {
    case 'loading':
      status.textContent = msg.data;
      break;
    case 'initiate':
      status.textContent = `Loading ${msg.file}...`;
      break;
    case 'progress':
      status.textContent = `Loading ${msg.file}: ${((msg.progress / msg.total) * 100).toFixed(1)}%`;
      break;
    case 'done':
      status.textContent = `Loaded ${msg.file}`;
      break;
    case 'ready':
      status.textContent = '🟢 Model is ready';
      loadBtn.disabled = true;
      genBtn.disabled = false;
      break;
    case 'start':
      status.textContent = 'Generating...';
      output.textContent = '';
      break;
    case 'update':
      output.textContent += msg.output;
      break;
    case 'complete':
      status.textContent = '✅ Complete';
      break;
    case 'error':
      status.textContent = `❌ Error: ${msg.data}`;
      break;
  }
});

loadBtn.addEventListener('click', () => {
  worker.postMessage({ type: 'load' });
  loadBtn.disabled = true;
  status.textContent = 'Starting model load...';
});

genBtn.addEventListener('click', () => {
  const userPrompt = promptInput.value.trim();
  if (userPrompt.length === 0) return;
  worker.postMessage({
    type: 'generate',
    data: [{ role: 'user', content: userPrompt }],
  });
});
