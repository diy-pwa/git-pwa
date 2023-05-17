#!/usr/bin/env node

import GitLoader from './src/GitLoader.js';
import ora from 'ora';
import readline from 'node:readline';
import ini from 'ini';
import fs, { read } from 'fs';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (sQuestion) => {
  return new Promise((resolve, reject) => {
    rl.question(sQuestion, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
};

async function main() {
  const spinner = ora(`running git ${process.argv[2] || ''} ... `).start();

  const oLoader = new GitLoader();

  const aIgnoreCommands = ['clone', 'init', 'status'];

  if (!aIgnoreCommands.includes(process.argv[2]) && !oLoader.config.user) {
    oLoader.config.user = {};
    oLoader.config.user.name = await question('Enter your user name: ');
    oLoader.config.user.email = await question('Enter your email: ');
    fs.writeFileSync(
      `${oLoader.base.dir}/${oLoader.base.gitdir}/config`,
      ini.stringify(oLoader.config)
    );
  }
  if (
    !aIgnoreCommands.includes(process.argv[2]) &&
    !oLoader.config.user.token
  ) {
    oLoader.config.user.token = await question('Enter your token: ');
    fs.writeFileSync(
      `${oLoader.base.dir}/${oLoader.base.gitdir}/config`,
      ini.stringify(oLoader.config)
    );
  }

  oLoader
    .runCommand()
    .then((rc) => {
      if (rc) {
        console.log(rc);
      }
    })
    .catch((e) => {
      console.log(e.toString());
    })
    .finally(() => {
      spinner.stop();
    });
}

main();
