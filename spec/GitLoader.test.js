import { describe, it, expect, beforeEach } from 'vitest';
import GitLoader from "../src/GitLoader.js";
import fs from 'fs';
import ini from 'ini';
import {exec} from 'node:child_process';

beforeEach(async()=>{
    await fs.promises.rm("test", { recursive: true, force: true });
});

describe("git-cli for a pwa", () => {
    it("clones a coming soon project", async () => {
        let oLoader = new GitLoader({argv:{_:['','','clone', 'https://github.com/diy-pwa/coming-soon.git', "test"],branch:'next'}});
        await oLoader.runCommand();
        expect(fs.existsSync("test/vite.config.js")).toBe(true);
    });
    it("says the status is up to date only if all committed", async () => {
        await fs.promises.mkdir("test");
        await exec("cd test");
        let oLoader = new GitLoader({argv:{_:['','','status']}});
        const rc = await oLoader.runCommand();
        await exec("cd ..");
        expect(rc == "working folder up to date").toBe(false);
    });
    it("does a git init",async () =>{
        await fs.promises.mkdir("test");
        await exec("cd test");
        let oLoader = new GitLoader({argv:{_:['','','init']}, b:"main"});
        await oLoader.runCommand();
        const oConfig = ini.parse(fs.readFileSync(`${oLoader.base.dir}/${oLoader.base.gitdir}/config`, 'utf-8'));
        await exec("cd ..");
        expect(oConfig.base.ignorecase).toBe(true);
    });

});
