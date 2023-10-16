import fs from 'fs';
import question from './question.js';
import path from 'path';
import ini from 'ini';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';
import parseArgs from 'minimist';

export default class {
    constructor(init) {
        if (typeof init != 'undefined') {
            Object.assign(this, init);
        } else {
            this.argv = parseArgs(process.argv);
        }
        this.base = {
            gitdir: '.git',
            dir: '.',
            fs: fs,
            http,
        };
        this.base.USER_TOKEN = process.env['USER_TOKEN'];
        this.base.onAuth = () => ({ username: this.base.USER_TOKEN });
        try {
            this.config = ini.parse(
                fs.readFileSync(`${this.base.dir}/${this.base.gitdir}/config`, 'utf-8')
            );
        } catch {
            this.config = {};
        }
        this.base.corsProxy = 'https://corsproxy-dqo.pages.dev/corsproxy';
        if (this.config && this.config.http && this.config.http.corsProxy) {
            this.base.corsProxy = this.config.http.corsProxy;
        }
    }
    async runCommand() {
        try {
            this.base.ref = await git.currentBranch(this.base);
        } catch {
            // don't need this
            0;
        }
        this.command = {
            add: async (oConfig) => {
                let filelist = ['', `on branch ${this.base.ref}`];
                if (oConfig.filepath == "." || oConfig.filepath == "all") {

                    const aFiles = await git.statusMatrix(oConfig);
                    for (const aFile of aFiles) {
                        if (aFile[1] == 1 && aFile[2] == 1 && aFile[3] == 1) {
       
                      //unchanged
                        } else {
                            oConfig.filepath = aFile[0];
                            await git.add(oConfig);
                            filelist.push(`added ${aFile[0]}`);
                        }
                    }
                    if (filelist.length <= 2) {
                        filelist.push("nothing to add");
                    }
                } else {
                    await git.add(oConfig);
                    filelist.push(`added ${oConfig.filepath}`);
                }
                return (filelist.join("\n"));
            },
            push: async (oConfig) => {
                if(this.argv["u"]){
                    oConfig.remote = this.argv["u"];
                    oConfig.ref = this.argv._[3];
                }
                const rc = await git.push(oConfig);
                if (rc.ok) {
                    return 'pushed';
                } else {
                    throw new Error(rc);
                }
            },
            remote: async (oConfig) => {
                if (this.argv._[3] == 'add') {
                    oConfig.remote = this.argv._[4];
                    oConfig.url = this.argv._[5];
                    console.log(`remote add ${JSON.stringify(oConfig)}`);
                    await git.addRemote(oConfig);
                }
            },
            status: async (oConfig) => {
                if (oConfig.filepath) {
                    return git.status(oConfig);
                } else {
                    let filelist = ['', `on branch ${this.base.ref}`];
                    const aFiles = await git.statusMatrix(oConfig);
                    for (const aFile of aFiles) {
                        if (aFile[1] == 1 && aFile[2] == 1 && aFile[3] == 1) {
                            // file is unchanged
                        } else {
                            filelist.push(`${aFile[0]}: locally modified`);
                        }
                    }
                    if (filelist.length <= 2) {
                        filelist.push('working folder up to date');
                    }
                    return filelist.join('\n');
                }
            },
        };
        const oConfig = this.getConfig();
        if (typeof this.command[this.argv._[2]] != 'undefined') {
            // add new command
            return await this.command[this.argv._[2]](oConfig);
        } else if (typeof git[this.argv._[2]] != 'undefined') {
            return await git[this.argv._[2]](oConfig);
        } else {
            throw new Error('unimplemented');
        }
    }
    getConfig(){
        let oConfig = {};
        Object.assign(oConfig, this.base);
        this.commandData = {
            clone: {
                url: this.argv._[3],
                ref: this.argv.b || this.argv.branch || 'main',
                singleBranch: true,
                depth: 10,
                dir: this.argv._[4] || path.basename(this.argv._[3] || '', '.git'),
                gitdir: undefined,
            },
            add: {
                filepath: this.argv._[3],
            },
            rm: {
                filepath: this.argv._[3],
            },
            status: {
                filepath: this.argv._[3],
            },
            commit: {
                message: this.argv.m,
                author: { name: process.env['USER_NAME'], email: process.env['USER_EMAIL'] }
            },
            addRemote: {
                remote: this.argv._[3],
                url: this.argv._[4],
            },
            push: {
                remote: this.argv._[3] || 'origin',
                ref: this.argv._[4] || this.base.ref,
            },
            init: {
                dir: this.argv._[3] || this.base.dir,
                defaultBranch: this.argv.b || this.base.ref,
            },
            branch: {
                ref: this.argv._[3] || this.argv["M"] || this.base.ref,
            },
        };
        if (typeof this.commandData[this.argv._[2]] != 'undefined') {
            Object.assign(oConfig, this.commandData[this.argv._[2]]);
        }
        return oConfig;
    }
    async checkCommand() {
        const aIgnoreCommands = ['init', 'status'];
        const oConfig = this.getConfig();

        if (!aIgnoreCommands.includes(this.argv._[2]) && !process.env['USER_NAME']) {
            process.env['USER_NAME'] = await question('Enter your user name: ');
            process.env['USER_EMAIL'] = await question('Enter your email: ');
            fs.appendFileSync('.env', `USER_NAME="${process.env['USER_NAME']}"\n`);
            fs.appendFileSync('.env', `USER_EMAIL="${process.env['USER_EMAIL']}"\n`);
        }
        if (!aIgnoreCommands.includes(this.argv._[2]) && !process.env['USER_TOKEN']) {
            process.env['USER_TOKEN'] = await question('Enter your token: ');
            fs.appendFileSync('.env', `USER_TOKEN="${process.env['USER_TOKEN']}"\n`);
        }
        if(this.argv._[2] == "add" && this.argv._[3] != "." && this.argv._[3] != "all"){
            // check for other unadded files
            const aFiles = await git.statusMatrix(oConfig);
            let bChangedUnadded = false;
            for (const aFile of aFiles) {
                if(aFile[0] != this.argv._[3] && 
                !(aFile[1] == 1 && aFile[2] == 1 && aFile[3] == 1 ) &&
                !(aFile[2] == 2 && aFile[3] == 2)){
                    bChangedUnadded = true;
                    console.log(aFile[0]);
                }
            }
            if(bChangedUnadded){
                const sAddAll = await question("These files also have un-added changes ... do you want to add them all to what will be committed (y or n)\n");
                if(sAddAll.match(/(y|Y)/)){
                    this.argv._[3] = ".";
                }
            }
        }

    }
}
