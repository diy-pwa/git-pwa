#!/usr/bin/env node
import GitLoader from './src/GitLoader.js';
import ora from 'ora';
import 'dotenv/config';

async function main() {

  const oLoader = new GitLoader();
  await oLoader.checkCommand();
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
