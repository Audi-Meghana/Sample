const { spawn, spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const backendRoot = path.resolve(__dirname);
const aiRoot = path.resolve(__dirname, 'AI_services');
const requirementsFile = path.join(aiRoot, 'requirements.txt');

function findPython() {
  const candidates = ['python3', 'python', '/usr/bin/python3', '/usr/bin/python'];
  for (const cmd of candidates) {
    try {
      const result = spawnSync(cmd, ['--version'], { stdio: 'pipe' });
      if (result.status === 0) {
        console.log(`Found Python at: ${cmd}`);
        return cmd;
      }
    } catch (e) {
      // Continue to next candidate
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
  try {
    const result = spawnSync(python, ['-m', 'pip', 'install', '--quiet', '--no-cache-dir', '-r', requirementsFile], {
      cwd: aiRoot,
      stdio: 'inherit',
      timeout: 300000 // 5 minutes timeout
    });

    if (result.status !== 0) {
      console.error('Failed to install Python dependencies. Exit code:', result.status);
      console.error('Error output:', result.stderr?.toString());
      process.exit(1);
    }
    console.log('Python dependencies installed successfully.');
  } catch (error) {
    console.error('Error installing Python dependencies:', error.message);
    process.exit(1);
  }
}

const python = findPython();
if (!python) {
  console.error('Python is not installed or not available on PATH.');
  console.error('Checked paths: python3, python, /usr/bin/python3, /usr/bin/python');
  process.exit(1);
}

const env = { ...process.env };
const fastapiUrl = env.FASTAPI_URL || 'http://127.0.0.1:8000';

console.log('Starting backend with FastAPI service...');
console.log('Python command:', python);
console.log('FastAPI URL:', fastapiUrl);
console.log('Backend port:', env.PORT || 3000);
console.log('Working directory:', process.cwd());
console.log('AI Services directory:', aiRoot);

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

// Wait for FastAPI to be ready
function waitForFastAPI(callback, retries = 30) {
  const https = require('https');
  const http = require('http');

  const url = new URL(fastapiUrl);
  const client = url.protocol === 'https:' ? https : http;

  const req = client.request({
    hostname: url.hostname,
    port: url.port,
    path: '/health',
    method: 'GET',
    timeout: 5000
  }, (res) => {
    if (res.statusCode === 200) {
      console.log('FastAPI is ready!');
      callback();
    } else {
      console.log(`FastAPI health check returned ${res.statusCode}, retrying...`);
      if (retries > 0) {
        setTimeout(() => waitForFastAPI(callback, retries - 1), 2000);
      } else {
        console.error('FastAPI failed to start after 60 seconds');
        process.exit(1);
      }
    }
  });

  req.on('error', (err) => {
    console.log(`FastAPI not ready yet (${err.message}), retrying...`);
    if (retries > 0) {
      setTimeout(() => waitForFastAPI(callback, retries - 1), 2000);
    } else {
      console.error('FastAPI failed to start after 60 seconds');
      process.exit(1);
    }
  });

  req.end();
}

console.log('Waiting for FastAPI to be ready...');
waitForFastAPI(() => {
  console.log('Starting Node.js backend...');

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