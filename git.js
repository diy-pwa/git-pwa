#!/usr/bin/env node
import question from './src/question.js';
import GitLoader from './src/GitLoader.js';
import ora from 'ora';
import ini from 'ini';
import fs, { read } from 'fs';

async function main() {
  const oLoader = new GitLoader();

  const aIgnoreCommands = ['init', 'status'];

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
  const spinner = ora(`running git ${process.argv[2] || ''} ... `).start();
  try{
    const rc = await oLoader.runCommand();
    if (rc) {
      console.log(rc);
    }
  }catch(e){
    console.log(e.toString());
  }
  spinner.stop();
}

main().then(()=>{
  process.exit();
});
