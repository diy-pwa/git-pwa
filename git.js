#!/usr/bin/env node

import GitLoader from './src/GitLoader.js';
import ora from 'ora';
import readLineSync from 'readline-sync';
import ini from 'ini';
import fs, { read } from 'fs';

const spinner = ora(`running git ${process.argv[2] || ""} ... `).start();

const oLoader = new GitLoader();

if(!oLoader.config.user){
    oLoader.config.user = {};
    oLoader.config.user.name = readLineSync.question("Enter your user name: ");
    oLoader.config.user.email = readLineSync.question("Enter your email: ");
    fs.writeFileSync(`${oLoader.base.dir}/${oLoader.base.gitdir}/config`, ini.stringify(oLoader.config));
}
if(!oLoader.config.user.token){
    oLoader.config.user.token = readLineSync.question("Enter your token: ");
    fs.writeFileSync(`${oLoader.base.dir}/${oLoader.base.gitdir}/config`, ini.stringify(oLoader.config));
}

oLoader.runCommand().then((rc)=>{
    if(rc){
        console.log(rc);
    }
}).catch((e) => {
    console.log(e.toString());
}).finally(()=>{
    spinner.stop();
});
