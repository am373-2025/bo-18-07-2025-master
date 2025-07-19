const chokidar = require('chokidar');
const { exec } = require('child_process');
const path = require('path');

// Dossiers/fichiers à ignorer
const IGNORED = ['node_modules', '.git', 'dist', 'build', '.cache', '.vite'];

// Initialisation du watcher
const watcher = chokidar.watch('.', {
  ignored: (filePath) => IGNORED.some(dir => filePath.includes(path.sep + dir)),
  persistent: true,
  ignoreInitial: true,
});

let isCommitting = false;
let pending = false;
let lastFile = '';

function autoCommitPush(file) {
  if (isCommitting) {
    pending = true;
    lastFile = file;
    return;
  }
  isCommitting = true;
  lastFile = file;
  exec('git add .', (err) => {
    if (err) return done();
    exec(`git commit -m "auto: ${file} modifié"`, (err2, stdout, stderr) => {
      // Si rien à commit, ne pas push
      if (stdout && stdout.includes('nothing to commit')) return done();
      exec('git push', () => done());
    });
  });
}

function done() {
  isCommitting = false;
  if (pending) {
    pending = false;
    autoCommitPush(lastFile);
  }
}

watcher.on('all', (event, filePath) => {
  if (event === 'change' || event === 'add' || event === 'unlink') {
    autoCommitPush(filePath.replace(/^\.\//, ''));
  }
});

console.log('⏱️  Auto Git Watcher lancé : chaque modification sera commit + push automatiquement.'); 