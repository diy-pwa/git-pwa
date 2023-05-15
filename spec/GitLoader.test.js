import { describe, it, expect, beforeEach } from 'vitest';
import GitLoader from "../src/GitLoader.js";
import fs from 'fs';

beforeEach(async()=>{
    await fs.promises.rm("test", { recursive: true, force: true });
});

describe("git-cli for a pwa", () => {
    it("clones a coming soon project", async () => {
        let oLoader = new GitLoader({argv:{_:['','','clone', 'https://github.com/diy-pwa/coming-soon.git', "test"],branch:'next'}});
        await oLoader.runCommand();
        expect(fs.existsSync("test/vite.config.js")).toBe(true);
    });
    it("deploys the git folder", async () => {
        let oLoader = new GitLoader({argv:{_:['','','deploy']}});
        const rc = await oLoader.runCommand();
        expect(rc).toBe("deployed");
    });
    it("says the status is up to date only if all committed", async () => {
        let oLoader = new GitLoader({argv:{_:['','','status']}});
        const rc = await oLoader.runCommand();
        expect(rc == "working folder up to date").toBe(false);
    });
});
