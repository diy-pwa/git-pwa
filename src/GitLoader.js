import fs from 'fs';
import path from 'path';
import ini from 'ini';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node/index.cjs';
import parseArgs from 'minimist';

export default class {
    constructor(init) {
        if (typeof (init) != "undefined") {
            Object.assign(this, init);
        } else {
            this.argv = parseArgs(process.argv);
        }
        this.base = {
            gitdir: '.git',
            dir: ".",
            fs: fs,
            http
        }
        try {
            this.config = ini.parse(fs.readFileSync(`${this.base.dir}/${this.base.gitdir}/config`, 'utf-8'));
            this.base.onAuth = () => ({ username:this.config.user.token});
        } catch {
            this.config = {};
        }
        this.base.corsProxy = 'https://corsproxy-dqo.pages.dev/gitcorsproxy';
        if (this.config && this.config.http && this.config.http.corsProxy) {
            this.base.corsProxy = this.config.http.corsProxy
        }
    }
    async runCommand() {
        const commandData = {
            clone: {
                url: this.argv._[3],
                ref: this.argv.b || this.argv.branch || 'main',
                singleBranch: true,
                depth: 10,
                dir: this.argv._[4] || path.basename(this.argv._[3] || "", ".git"),
                gitdir: undefined
            },
            add: {
                filepath: this.argv._[3]
            },
            rm: {
                filepath: this.argv._[3]
            },
            status: {
                filepath: this.argv._[3] || "."
            },
            commit: {
                message: this.argv.m
            },
            addRemote: {
                remote: this.argv._[3],
                url: this.argv._[4]
            },
            push: {
                remote: this.argv._[3] || "origin",
                ref: this.argv._[4] || await git.currentBranch(this.base)
            }

        }
        let oConfig = {};
        Object.assign(oConfig, this.base);
        if (typeof (commandData[this.argv._[2]]) != "undefined") {
            Object.assign(oConfig, commandData[this.argv._[2]]);
        }
        let rc = await git[this.argv._[2]](oConfig);
        return rc;
    }
}