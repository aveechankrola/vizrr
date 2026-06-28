/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const cp = require('child_process');
const path = require('path');
const chokidar = require('chokidar');
const electron = require('electron');

let child = null;
const reloadWatcher = {
  debouncer: null,
  ready: false,
  watcher: null,
  restarting: false,
};

const electronDir = __dirname;

/** Windows + Node 18+ require shell:true when spawning npm.cmd */
function runBuild() {
  return new Promise((resolve, reject) => {
    const childProc = cp.spawn('npm run build', {
      cwd: electronDir,
      shell: true,
      stdio: 'inherit',
    });
    childProc.once('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Electron build failed (exit ${code})`));
    });
    childProc.once('error', reject);
  });
}

async function spawnElectron() {
  if (child !== null) {
    child.stdin?.pause();
    child.kill();
    child = null;
    await runBuild();
  }
  child = cp.spawn(electron, ['--inspect=5858', '.'], {
    cwd: electronDir,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });
  child.on('exit', () => {
    if (!reloadWatcher.restarting) {
      process.exit(0);
    }
  });
  child.on('error', (err) => {
    console.error('Failed to start Electron:', err);
    process.exit(1);
  });
}

function setupReloadWatcher() {
  reloadWatcher.watcher = chokidar
    .watch(path.join(electronDir, 'src/**/*'), {
      ignored: /[/\\]\./,
      persistent: true,
    })
    .on('ready', () => {
      reloadWatcher.ready = true;
    })
    .on('all', () => {
      if (reloadWatcher.ready) {
        clearTimeout(reloadWatcher.debouncer);
        reloadWatcher.debouncer = setTimeout(async () => {
          console.log('Restarting');
          reloadWatcher.restarting = true;
          await spawnElectron();
          reloadWatcher.restarting = false;
          reloadWatcher.ready = false;
          clearTimeout(reloadWatcher.debouncer);
          reloadWatcher.debouncer = null;
          reloadWatcher.watcher?.close();
          reloadWatcher.watcher = null;
          setupReloadWatcher();
        }, 500);
      }
    });
}

(async () => {
  try {
    await runBuild();
    await spawnElectron();
    setupReloadWatcher();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
