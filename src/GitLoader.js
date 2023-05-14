import fs from 'fs';
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
        try {
            this.config = ini.parse(fs.readFileSync('./.git/config', 'utf-8'));
        } catch {
            this.config = {};
        }
        this.base = {
            gitdir: '.git',
            dir: '.',
            fs: fs,
            http,
        };
        this.base.corsProxy = 'https://corsproxy-dqo.pages.dev/gitcorsproxy';
        if (this.config && this.config.http && this.config.http.corsProxy) {
            this.base.corsProxy = this.config.http.corsProxy;
        }
        this.commandData = {
            clone: {
                url: this.argv._[3],
                ref: this.argv.b || this.argv.branch || 'main',
                singleBranch: true,
                depth: 10,
                dir: this.argv._[4] || path.basename(this.argv._[3] || '', '.git'),
                gitdir: undefined,
            },
        };
        this.command = {
            deploy: () => {
                // see https://isomorphic-git.org/docs/en/snippets
                return 'deployed';
            },
            status: () => {
                return 'want to fix this for bare `git status`'
            }
        };
    }
    async runCommand() {
        let oConfig = {};
        Object.assign(oConfig, this.base);
        if (typeof this.commandData[this.argv._[2]] != 'undefined') {
            Object.assign(oConfig, this.commandData[this.argv._[2]]);
        }
        if (typeof this.command[this.argv._[2]] != 'undefined') {
            // add new command
            return await this.command[this.argv._[2]]();
        } else if (typeof git[this.argv._[2]] != 'undefined') {
            return await git[this.argv._[2]](oConfig);
        } else {
            throw new Error('unimplemented');
        }
    }
}
