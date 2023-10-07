import fs from 'fs';
import fsp from 'fs/promises';
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
    try {
      this.config = ini.parse(
        fs.readFileSync(`${this.base.dir}/${this.base.gitdir}/config`, 'utf-8')
      );
      this.base.onAuth = () => ({ username: this.config.user.token });
    } catch {
      this.config = {};
    }
    this.base.corsProxy = 'https://corsproxy-dqo.pages.dev/corsproxy';
    if (this.config && this.config.http && this.config.http.corsProxy) {
      this.base.corsProxy = this.config.http.corsProxy;
    }
  }
  match(first, second) {
    // If we reach at the end of both strings,
    // we are done
    if (first.length == 0 && second.length == 0) return true;

    // Make sure that the characters after '*'
    // are present in second string.
    // This function assumes that the first
    // string will not contain two consecutive '*'
    if (first.length > 1 && first[0] == '*' && second.length == 0) return false;

    // If the first string contains '?',
    // or current characters of both strings match
    if (
      (first.length > 1 && first[0] == '?') ||
      (first.length != 0 && second.length != 0 && first[0] == second[0])
    )
      return this.match(first.substring(1), second.substring(1));

    // If there is *, then there are two possibilities
    // a) We consider current character of second string
    // b) We ignore current character of second string.
    if (first.length > 0 && first[0] == '*')
      return (
        this.match(first.substring(1), second) ||
        this.match(first, second.substring(1))
      );

    return false;
  }
  isInGitignore(second) {
    for (let first of this.gitignore) {
      first = first.replace(/\/$/, '');
      if (this.match(first, second)) {
        return true;
      }
    }
    return false;
  }

  async walk(sDir, oConfig, filelist = []) {
    const files = await fsp.readdir(sDir);

    for (const file of files) {
      if (this.isInGitignore(file)) continue;
      const filepath = path.join(sDir, file);
      const stat = await fsp.stat(filepath);
      if (stat && stat.isDirectory()) {
        filelist = await this.walk(filepath, oConfig, filelist);
      } else {
        let filepath = file;
        if (sDir != '.') {
          filepath = `${sDir}/${file}`;
        }
        oConfig.filepath = filepath;
        const sStatus = await git.status(oConfig);
        if (sStatus != 'unmodified') {
          filelist.push(`${filepath} ${sStatus}`);
        }
      }
    }

    return filelist;
  }
  async runCommand() {
    try {
      this.base.ref = await git.currentBranch(this.base);
    } catch {
      // don't need this
      0;
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
        ref: this.argv._[3] || this.base.ref,
      },
    };
    this.command = {
      deploy: (oConfig) => {
        // see https://isomorphic-git.org/docs/en/snippets
        return 'deployed';
      },
      push: async (oConfig) => {
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
          git.addRemote(oConfig);
        }
      },
      status: async (oConfig) => {
        if (oConfig.filepath) {
          return git.status(oConfig);
        } else {
          let filelist = ['', `on branch ${this.base.ref}`];
          try {
            this.gitignore = fs
              .readFileSync('.gitignore')
              .toString()
              .split('\n');
          } catch {
            this.gitignore = [];
          }
          this.gitignore.unshift('.git');
          await this.walk('.', oConfig, filelist);
          if (filelist.length > 2) {
            return filelist.join('\n');
          } else {
            return 'working folder up to date';
          }
        }
      },
      commit: async (oConfig)=>{
        const sCommitHash = await git.commit(oConfig);
        let files = await git.listFiles({ fs, dir: this.argv._[4] || path.basename(this.argv._[3] || '', '.git'), ref: sCommitHash })
        console.log(files)
        return sCommitHash;
      },
    };
    let oConfig = {};
    Object.assign(oConfig, this.base);
    if (typeof this.commandData[this.argv._[2]] != 'undefined') {
      Object.assign(oConfig, this.commandData[this.argv._[2]]);
    }
    if (typeof this.command[this.argv._[2]] != 'undefined') {
      // add new command
      return await this.command[this.argv._[2]](oConfig);
    } else if (typeof git[this.argv._[2]] != 'undefined') {
      return await git[this.argv._[2]](oConfig);
    } else {
      throw new Error('unimplemented');
    }
  }
}
