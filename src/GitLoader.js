import fs from 'fs';
import question from './question.js';
import path from 'path';
import ini from 'ini';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';
import parseArgs from 'minimist';
import Promises from './Promises.js'
import 'dotenv/config';

export default class {
    constructor(init) {
        if (typeof init != 'undefined') {
            Object.assign(this, init);
        } else {
            this.argv = parseArgs(process.argv);
        }
        if(!this.fs){
            this.fs = fs;
            this.fs.promises.exists = async (sPath) =>{
                return null != await this.fs.promises.stat(sPath);
            }
        }else if (!this.fs.promises){
            this.fs.promises = new Promises({fs: this.fs});
        }
        this.base = {
            gitdir: '.git',
            dir: '.',
            fs: this.fs,
            http,
        };
        this.base.USER_TOKEN = process.env['USER_TOKEN'];
        this.base.onAuth = () => ({ username: this.base.USER_TOKEN });
    }
    getConfig() {
        let oConfig = {};
        Object.assign(oConfig, this.base);
        this.commandData = {
            add: {
                filepath: this.argv._[3],
            },
            branch: {
                ref: this.argv._[3] || this.argv["M"] || this.base.ref,
                object: "HEAD",
            },
            clone: {
                url: this.argv._[3],
                ref: this.argv.b || this.argv.branch || 'main',
                singleBranch: true,
                depth: 10,
                dir: this.argv._[4] || path.basename(this.argv._[3] || '', '.git'),
                gitdir: undefined,
            },
            commit: {
                message: this.argv["m"],
                author: { name: process.env['USER_NAME'], email: process.env['USER_EMAIL'] }
            },
            init: {
                dir: this.argv._[3] || this.base.dir,
                defaultBranch: this.argv.b || this.base.ref,
            },
            pull: {
                author: { name: process.env['USER_NAME'], email: process.env['USER_EMAIL'] }
            },
            push: {
                remote: this.argv._[3] || 'origin',
                ref: this.argv._[4] || this.base.ref,
            },
            rm: {
                filepath: this.argv._[3],
            },
            status: {
                filepath: this.argv._[3],
            },
        };
        if (typeof this.commandData[this.argv._[2]] != 'undefined') {
            Object.assign(oConfig, this.commandData[this.argv._[2]]);
        }
        return oConfig;
    }

    async runCommand() {
        if(!this.config){
            try {
                this.config = ini.parse(
                    await this.fs.promises.readFile(`${this.base.dir}/${this.base.gitdir}/config`, 'utf-8')
                );
            } catch {
                this.config = {};
            }
            this.base.corsProxy = 'https://corsproxy-dqo.pages.dev/corsproxy';
            if (this.config && this.config.http && this.config.http.corsProxy) {
                this.base.corsProxy = this.config.http.corsProxy;
            }
        }
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
                            if (aFile[0] == ".env") {
                                await this.fs.promises.writeFile(`${oConfig.dir}/.gitignore`, ".env\nnode_modules\n");
                                aFile[0] = ".gitignore";
                            }
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
            branch: async (oConfig) => {
                return await this.branchAndSetMergeRef(oConfig);
            },
            checkout: async (oConfig) => {
                if (this.argv["b"]) {
                    oConfig.ref = this.argv["b"];
                    await this.branchAndSetMergeRef(oConfig);
                } else {
                    oConfig.ref = this.argv._[3] || this.base.ref;
                    oConfig.noUpdateHead = true;
                    oConfig.force = true;

                    await git.checkout(oConfig);
                }
                let filelist = ['', `on branch ${oConfig.ref}`];
                filelist.push("checkout complete");
                return (filelist.join("\n"));
            },
            init: async (oConfig) => {
                if (this.fs.promises.exists(`${oConfig.dir}/.env`)) {
                    await this.fs.promises.writeFile(`${oConfig.dir}/.gitignore`, ".env\nnode_modules\n");
                }
                await git.init(oConfig);
                let filelist = ['', `on branch ${await git.currentBranch(this.base)}`];
                filelist.push(`init complete`);
                return filelist.join('\n');
            },
            push: async (oConfig) => {
                if (this.argv["u"]) {
                    oConfig.remote = this.argv["u"];
                    oConfig.ref = oConfig.remoteRef = this.argv._[3];
                }
                const rc = await git.push(oConfig);
                if (rc.ok) {
                    return 'pushed';
                } else {
                    throw new Error(rc);
                }
            },
            remote: async (oConfig) => {
                let filelist = ['', `on branch ${this.base.ref}`];
                if (this.argv._[3] == 'add') {
                    oConfig.remote = this.argv._[4];
                    oConfig.url = this.argv._[5];
                    oConfig.force = true;
                    await git.addRemote(oConfig);
                    filelist.push(`add remote ${oConfig.remote} ${oConfig.url}`);
                } else if (this.argv._[3] == 'remove') {
                    oConfig.remote = this.argv._[4];
                    await git.deleteRemote(oConfig);
                    filelist.push(`remove remote ${oConfig.remote}`);
                }
                return (filelist.join('\n'));
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
            const rc = await git[this.argv._[2]](oConfig);
            let filelist = ['', `on branch ${oConfig.ref}`];
            filelist.push(`${this.argv._[2]} complete ${rc ? rc : ""}`);
            return filelist.join('\n');
        } else {
            throw new Error('unimplemented');
        }
    }
    async checkCommand() {
        const aIgnoreCommands = ['init', 'status', 'clone', 'add', 'branch', 'checkout'];
        const oConfig = this.getConfig();

        if (!aIgnoreCommands.includes(this.argv._[2]) && !process.env['USER_NAME']) {
            process.env['USER_NAME'] = await question('Enter your user name: ');
            process.env['USER_EMAIL'] = await question('Enter your email: ');
            await this.fs.promises.appendFile('.env', `USER_NAME="${process.env['USER_NAME']}"\n`);
            await this.fs.promises.appendFile('.env', `USER_EMAIL="${process.env['USER_EMAIL']}"\n`);
        }
        if (!aIgnoreCommands.includes(this.argv._[2]) && !process.env['USER_TOKEN']) {
            process.env['USER_TOKEN'] = await question('Enter your token: ');
            await this.fs.promises.appendFile('.env', `USER_TOKEN="${process.env['USER_TOKEN']}"\n`);
        }
        if (this.argv._[2] == "add" && this.argv._[3] != "." && this.argv._[3] != "all") {
            // check for other unadded files
            const aFiles = await git.statusMatrix(oConfig);
            let bChangedUnadded = false;
            for (const aFile of aFiles) {
                if (aFile[0] != this.argv._[3] &&
                    !(aFile[1] == 1 && aFile[2] == 1 && aFile[3] == 1) &&
                    !(aFile[2] == 2 && aFile[3] == 2)) {
                    bChangedUnadded = true;
                    if (aFile[0] == ".env") {
                        await this.fs.promises.writeFile(`${oConfig.dir}/.gitignore`, ".env\nnode_modules\n");
                        console.log(".gitignore");
                    } else {
                        console.log(aFile[0]);
                    }
                }
            }
            if (bChangedUnadded) {
                const sAddAll = await question("These files also have un-added changes ... do you want to add them all to what will be committed (y or n)\n?");
                if (sAddAll.match(/(y|Y)/)) {
                    this.argv._[3] = ".";
                }
            }
        }

    }
    async branchAndSetMergeRef(oConfig) {
        oConfig.object = "HEAD";
        await git.branch(oConfig);
        const sOldHeadBranch = this.base.ref;
        const sOldHeadFile = `${oConfig.dir}/.git/${sOldHeadBranch}`;
        const sNewHeadBranch = oConfig.ref;
        const sNewHeadFile = `${oConfig.dir}/.git/${sNewHeadBranch}`
        try {
            if (await this.fs.promises.exists(sOldHeadFile)) {
                await this.fs.promises.rename(sOldHeadFile, sNewHeadFile);
            } else if (!this.fs.promises.exists(sNewHeadFile)) {
                throw (`no head file ${sOldHeadFile}`);
            }
            const sHeadRef = `${oConfig.dir}/.git/HEAD`;
            if (this.fs.promises.exists(sHeadRef)) {
                await this.fs.promises.writeFile(sHeadRef, `ref: refs/heads/${sNewHeadBranch}\n`);
            }
            this.config[`branch "${oConfig.ref}"`] = { merge: `refs/head/${oConfig.ref}` };
            await this.fs.writeFileSync(
                `${this.base.dir}/${this.base.gitdir}/config`,
                ini.stringify(this.config)
            );
            let filelist = ['', `on branch ${await git.currentBranch(this.base)}`];
            filelist.push("branched");
            return (filelist.join("\n"));
        } catch {
            // maybe a git init will work
            if (await this.fs.promises.exists(`${oConfig.dir}/.env`)) {
                await this.fs.promises.writeFile(`${oConfig.dir}/.gitignore`, ".env\nnode_modules\n");
            }
            oConfig.defaultBranch = oConfig.ref;
            await git.init(oConfig);
            let filelist = ['', `on branch ${await git.currentBranch(this.base)}`];
            filelist.push(`init complete`);
            return filelist.join('\n');
        }


    }
}
