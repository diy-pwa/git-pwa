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
});
