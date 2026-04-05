const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendRoot = path.resolve(__dirname);
const aiRoot = path.resolve(__dirname, 'AI_services');
const requirementsFile = path.join(aiRoot, 'requirements.txt');

function findPython() {
  const candidates = ['python3', 'python'];
  for (const cmd of candidates) {
    const result = spawnSync(cmd, ['--version'], { stdio: 'ignore' });
    if (result.status === 0) {
      return cmd;
    }
  }
  return null;
}

function installPythonDependencies(python) {
  if (!fs.existsSync(requirementsFile)) {
    console.warn('No requirements.txt found for Python dependencies. Skipping install.');
    return;
  }

  console.log('Installing Python dependencies...');
  const result = spawnSync(python, ['-m', 'pip', 'install', '--quiet', '--no-cache-dir', '-r', requirementsFile], {
    cwd: aiRoot,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    console.error('Failed to install Python dependencies.');
    process.exit(1);
  }
}

const python = findPython();
if (!python) {
  console.error('Python is not installed or not available on PATH.');
  process.exit(1);
}

const env = { ...process.env };
const fastapiUrl = env.FASTAPI_URL || 'http://127.0.0.1:8000';

console.log('Starting backend with FastAPI service...');
console.log('Python command:', python);
console.log('FastAPI URL:', fastapiUrl);
console.log('Backend port:', env.PORT || 3000);

installPythonDependencies(python);

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