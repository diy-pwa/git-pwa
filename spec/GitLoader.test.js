import { describe, it, expect, beforeEach } from 'vitest';
import GitLoader from "../src/GitLoader.js";
import fs from 'fs';
import ini from 'ini';

beforeEach(async()=>{
    await fs.promises.rm("test", { recursive: true, force: true });
});

describe("git-cli for a pwa", () => {
    it("clones a coming soon project", async () => {
        let oLoader = new GitLoader({argv:{_:['','','clone', 'https://github.com/diy-pwa/coming-soon.git', "test"],branch:'next'}});
        await oLoader.runCommand();
        expect(fs.existsSync("test/vite.config.js")).toBe(true);
    }, 10000);
    it("says the status is up to date only if all committed", async () => {
        await fs.promises.mkdir("test");
        let oLoader = new GitLoader({argv:{_:['','','status']}});
        // need to do this to workaround problem in isomorphic git
        oLoader.base.gitdir = "test/.git";
        oLoader.base.dir = "test";
        const rc = await oLoader.runCommand();
        expect(rc.match(/working folder up to date/) == null).toBe(false);
    });
    it("does a git init",async () =>{
        await fs.promises.mkdir("test");
        let oLoader = new GitLoader({argv:{_:['','','init']}, b:"main"});
        // need to do this to workaround problem in isomorphic git
        oLoader.base.gitdir = "test/.git";
        oLoader.base.dir = "test";
        await oLoader.runCommand();
        const oConfig = ini.parse(fs.readFileSync(`${oLoader.base.gitdir}/config`, 'utf-8'));
        expect(oConfig.core.ignorecase).toBe(true);
    });
    it("does a git branch", async ()=>{
        await fs.promises.mkdir("test");
        let oLoader = new GitLoader({argv:{_:['','','branch'], M:"main"}});
        // need to do this to workaround problem in isomorphic git
        oLoader.base.gitdir = "test/.git";
        const rc = await oLoader.runCommand();
        expect(rc.match(/on branch main/) == null).toBe(false);

    });
    it("does a git commit and creates a .gitignore to protect .env", async ()=>{
        await fs.promises.mkdir("test");
        await fs.promises.writeFile("test/.env", 'secret="sh"\n');
        let oLoader = new GitLoader({argv:{_:['','','init']}, b:"main"});
        // need to do this to workaround problem in isomorphic git
        oLoader.base.gitdir = "test/.git";
        oLoader.base.dir = "test";
        await oLoader.runCommand();
        expect(fs.existsSync("test/.gitignore")).toBe(true);
    })

});
