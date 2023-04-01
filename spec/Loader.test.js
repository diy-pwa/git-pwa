import { describe, it, expect, beforeEach } from 'vitest';
import Loader from "../src/Loader.js";
import fs from 'fs';

beforeEach(async()=>{
    await fs.promises.rm("test", { recursive: true, force: true });
});

describe("Loader is to load from the command line", () => {
    it("creates a coming soon project", async () => {
        let oLoader = new Loader({argv:['','','create'], dest: "test"});
        await oLoader.runCommand();
        expect(fs.existsSync("test/vite.config.js")).toBe(true);
    });
});
