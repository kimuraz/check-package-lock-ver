#! /usr/bin/env node
import path from 'path';
import fs from 'fs';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

function setup(args) {
  const root = args.root === '.' ? process.cwd() : args.root;
  const dirs = args.dirs?.split(',') || fs.readdirSync(root).filter((f) => fs.statSync(path.join(root, f)).isDirectory());

  return { root, dirs: dirs.map(d => path.join(root, d.trim())) };
}

function parsePackageLock(dir) {
  const packageLockPath = path.join(dir, 'package-lock.json');
  return new Promise((resolve, _) => {
    fs.readFile(packageLockPath, (err, data) => {
      if (err) {
        resolve(null);
      } else {
        const packageLock = JSON.parse(data);
        const projectName = packageLock.name;
        const { packages } = packageLock;
        const depsWithVersions = Object.keys(packages || {}).filter(k => !!k).reduce((acc, key) => {
          const { version } = packages[key];
          const packageName = key.split('/').pop();
          if (!acc[packageName]) {
            acc[packageName] = [];
          }
          acc[packageName].push(version); return acc;
        }, {});

        resolve({ projectName, deps: depsWithVersions });
      }
    });
  });
}

function getAllDeps(dirs) {
  return Promise.all(dirs.map(parsePackageLock));
};

function findCommonDepsOnAllProjects(projectDeps) {
  const allDeps = projectDeps.reduce((acc, { projectName, deps }) => {
    Object.keys(deps).forEach((dep) => {
      if (!acc[dep]) {
        acc[dep] = {};
      }
      acc[dep] = { ...acc[dep], [projectName]: deps[dep] };
    });
    return acc;
  }, {});

  const commonDeps = Object.keys(allDeps).reduce((acc, dep) => {
    if (Object.keys(allDeps[dep]).length > 1) {
      acc[dep] = allDeps[dep];
    }
    return acc;
  }, {});

  return commonDeps;
}

function main(args) {
  let dirs;
  try {
    ({ dirs } = setup(args));
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
  getAllDeps(dirs).then((results) => {
    const filteredResults = results.filter(r => !!r);
    if (filteredResults.length <= 1) {
      console.warn('Insufficient projects to analyze');
      process.exit(0);
    }
    const commonDeps = findCommonDepsOnAllProjects(filteredResults);
    Object.keys(commonDeps).forEach((dep) => {
      if (args.filter && !new RegExp(args.filter).test(dep)) {
        return;
      }
      console.log(`== ${dep} ==`);
      console.table(commonDeps[dep]);
    });
  }).catch((e) => {
      console.error(e.message);
      process.exit(1);
    });
}

yargs(hideBin(process.argv))
  .command('$0', 'Execute package-lock checker', (args) => {
    return args.option('root', {
      alias: 'r',
      describe: 'Root directory',
      type: 'string',
      default: '.',
    }).option('dirs', {
        alias: 'd',
        describe: 'Directories to check for package-lock.json from root directory separated by comma',
        type: 'string',
        default: null,
    }).option('filter', {
        alias: 'f',
        describe: 'Filter dependencies for display. Should be a JS regex',
        type: 'string',
        default: null,
    });
  }, main).parse(); 
