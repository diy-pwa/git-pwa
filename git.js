#!/usr/bin/env node

import GitLoader from './src/GitLoader.js';
import ora from 'ora';

const spinner = ora(`running git ${process.argv[2] || ''} ... `).start();

const oLoader = new GitLoader();

oLoader
  .runCommand()
  .then((e) => {
    if (typeof e != 'undefined') {
      console.log(e);
    }
  })
  .catch((e) => {
    console.log(e.toString());
  })
  .finally(() => {
    spinner.stop();
  });
