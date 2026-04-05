const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendRoot = path.resolve(__dirname);
const aiRoot = path.resolve(__dirname, 'AI_services');

function findPython() {
  const candidates = ['python3', 'python'];
  for (const cmd of candidates) {
    try {
      const which = spawn(cmd, ['--version']);
      which.on('error', () => {});
      if (fs.existsSync(`/usr/bin/${cmd}`) || fs.existsSync(`/usr/local/bin/${cmd}`)) {
        return cmd;
      }
    } catch (_) {}
  }
  return 'python';
}

const python = findPython();
const env = { ...process.env };
const fastapiScript = path.join(aiRoot, 'app', 'main.py');

console.log('Starting backend with FastAPI service...');
console.log('Python command:', python);
console.log('FastAPI URL:', env.FASTAPI_URL || 'http://127.0.0.1:8000');
console.log('Backend port:', env.PORT || 3000);

const fastapi = spawn(python, ['-m', 'uvicorn', 'app.main:app', '--host', '0.0.0.0', '--port', '8000'], {
  cwd: aiRoot,
  env,
  stdio: ['ignore', 'pipe', 'pipe']
});

fastapi.stdout.on('data', (data) => {
  process.stdout.write(`[FastAPI] ${data}`);
});
fastapi.stderr.on('data', (data) => {
  process.stderr.write(`[FastAPI ERROR] ${data}`);
});
fastapi.on('exit', (code, signal) => {
  console.error(`FastAPI exited with code=${code} signal=${signal}`);
  process.exit(code || 1);
});

const backend = spawn('node', ['server.js'], {
  cwd: backendRoot,
  env,
  stdio: ['ignore', 'pipe', 'pipe']
});

backend.stdout.on('data', (data) => {
  process.stdout.write(`[Backend] ${data}`);
});
backend.stderr.on('data', (data) => {
  process.stderr.write(`[Backend ERROR] ${data}`);
});
backend.on('exit', (code, signal) => {
  console.error(`Backend exited with code=${code} signal=${signal}`);
  fastapi.kill('SIGTERM');
  process.exit(code || 1);
});

process.on('SIGINT', () => {
  fastapi.kill('SIGTERM');
  backend.kill('SIGTERM');
  process.exit(0);
});

process.on('SIGTERM', () => {
  fastapi.kill('SIGTERM');
  backend.kill('SIGTERM');
  process.exit(0);
});