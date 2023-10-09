#!/usr/bin/env node
import question from './src/question.js';
import GitLoader from './src/GitLoader.js';
import ora from 'ora';
import ini from 'ini';
import fs from 'fs';
import 'dotenv/config';

async function main() {

  const aIgnoreCommands = ['init', 'status'];

  if (!aIgnoreCommands.includes(process.argv[2]) && !process.env['USER_NAME']) {
    process.env['USER_NAME'] = await question('Enter your user name: ');
    process.env['USER_EMAIL'] = await question('Enter your email: ');
    fs.appendFileSync('.env', `USER_NAME="${process.env['USER_NAME']}"\n`);
    fs.appendFileSync('.env', `USER_EMAIL="${process.env['USER_EMAIL']}"\n`);
  }
  if (!aIgnoreCommands.includes(process.argv[2]) && !process.env['USER_TOKEN']) {
    process.env['USER_TOKEN'] = await question('Enter your token: ');
    fs.appendFileSync('.env', `USER_TOKEN="${process.env['USER_TOKEN']}"\n`);
  }
  const oLoader = new GitLoader();
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
