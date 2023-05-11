import fs from 'fs';
import path from 'path';
import ini from 'ini';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';
import readlineSync from 'readline-sync';
import parseArgs from 'minimist';

export default class{
    constructor(init)
    {
        if (typeof (init) != "undefined") {
            Object.assign(this, init)
        }else{
            this.argv = parseArgs(process.argv);
            this.corsProxy = 'https://corsproxy-dqo.pages.dev/gitcorsproxy';
        }
        this.commands = {
            clone: async ()=>{
                try{
                    var sUrl = this.argv._[3];
                }catch(e){
                    throw new Error(`
usage:
    git clone <url to clone> <optional folder to clone into>
                    `);

                }
                const msg = await git.clone({
                    corsProxy: this.corsProxy,
                    url: sUrl,
                    ref: this.argv.b || this.argv.branch ||'main',
                    singleBranch: true,
                    depth: 10,
                    dir: this.argv._[4] || path.basename(sUrl, ".git"),
                    fs: fs,
                    http
                  });
            },
            pull: async () =>{
                const msg = await git.pull({
                    corsProxy: this.corsProxy,
                    fs: fs,
                    http,
                    gitdir: '.git',
                    dir: "."
                });
            },
            deploy: async ()=>{
                try{
                    var config = ini.parse(fs.readFileSync('./.git/config', 'utf-8'));
                    if(!config.user || !config.user.password){
                        config.user = {};
                        config.user.password = readlineSync.question("enter your token: ");
                        fs.writeFileSync('./config_modified.ini', ini.stringify(config));
                    }
                }catch(e){
                    throw new Error(`
deploy to gh-pages branch usage:
    git deploy
                    `);

                }
            }
        }
    }
    async runCommand(sCommandFolder){
        let nExitCode = 0;
        if(typeof(this.commands[this.argv._[2]]) != "undefined"){
            nExitCode = await this.commands[this.argv._[2]](sCommandFolder);
        }else{
            nExitCode = 2; //(not found I feel)
            throw new Error(`
usage:
    git <command> <subcommand>
            `);
        }
        return nExitCode;
    }
}