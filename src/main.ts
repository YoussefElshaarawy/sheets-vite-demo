// main.ts
import './style.css';

const container = document.createElement('div');
container.style.cssText = `
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  font-family: sans-serif;
`;
document.body.appendChild(container);

const loadBtn = document.createElement('button');
loadBtn.textContent = 'Load SmolLM2 Model';
loadBtn.style.padding = '12px';
loadBtn.style.marginBottom = '16px';
container.appendChild(loadBtn);

const progressBar = document.createElement('div');
progressBar.style.height = '24px';
progressBar.style.width = '300px';
progressBar.style.background = '#eee';
progressBar.style.borderRadius = '4px';
progressBar.style.overflow = 'hidden';
const fill = document.createElement('div');
fill.style.height = '100%';
fill.style.width = '0%';
fill.style.background = '#4caf50';
progressBar.appendChild(fill);
container.appendChild(progressBar);

const input = document.createElement('textarea');
input.rows = 4;
input.cols = 50;
input.placeholder = 'Enter your prompt here...';
input.style.marginTop = '24px';
container.appendChild(input);

const genBtn = document.createElement('button');
genBtn.textContent = 'Generate';
genBtn.disabled = true;
genBtn.style.marginTop = '12px';
genBtn.style.padding = '12px';
container.appendChild(genBtn);

const output = document.createElement('pre');
output.style.marginTop = '16px';
output.style.maxWidth = '80%';
output.style.whiteSpace = 'pre-wrap';
container.appendChild(output);

const worker = new Worker(new URL('./worker.js', import.meta.url), {
  type: 'module',
});

worker.addEventListener('message', (e) => {
  const msg = e.data;
  switch (msg.status) {
    case 'loading':
      output.textContent = msg.data;
      break;
    case 'initiate':
      fill.style.width = '0%';
      break;
    case 'progress':
      fill.style.width = `${(msg.progress / msg.total) * 100}%`;
      break;
    case 'done':
      fill.style.width = '100%';
      break;
    case 'ready':
      output.textContent = 'Model ready ✅';
      genBtn.disabled = false;
      break;
    case 'start':
      output.textContent = '';
      break;
    case 'update':
      output.textContent += msg.output;
      break;
    case 'complete':
      output.textContent += '\n✅ Complete';
      break;
    case 'error':
      output.textContent = `❌ Error: ${msg.data}`;
      break;
  }
});

loadBtn.onclick = () => {
  worker.postMessage({ type: 'load' });
  loadBtn.disabled = true;
};

genBtn.onclick = () => {
  worker.postMessage({
    type: 'generate',
    data: [{ role: 'user', content: input.value }],
  });
};
