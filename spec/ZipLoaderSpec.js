import ZipLoader from "../src/ZipLoader.js";
import fs from 'fs';

beforeEach(async()=>{
    await fs.promises.rm("test", { recursive: true, force: true });
});

describe("Zip loader is to load from", () => {
    it("downloads a .zip file", async () => {
        let oZipLoader = new ZipLoader();
        await oZipLoader.load("https://github.com/diy-pwa/diy-pwa/archive/refs/heads/main.zip", "test");
        expect(fs.existsSync("test/main.zip")).toBe(true);
    });
    it("unzips the file", async () => {
        let oZipLoader = new ZipLoader();
        await oZipLoader.load("https://github.com/diy-pwa/diy-pwa/archive/refs/heads/main.zip", "test");
        await oZipLoader.unzip("https://github.com/diy-pwa/diy-pwa/archive/refs/heads/main.zip", "test");
        expect(fs.existsSync("test/package.json")).toBe(true);
    });
    it("backs up package.json file", async () => {
        let oZipLoader = new ZipLoader();
        try{
            await fs.promises.access("test");
        }catch{
            await fs.promises.mkdir("test", {recursive: true});
        }
        await fs.promises.writeFile("test/package.json", "Rich was here");
        await oZipLoader.load("https://github.com/diy-pwa/diy-pwa/archive/refs/heads/main.zip", "test");
        expect(fs.existsSync("test/package.json.bak")).toBe(true);
    });

  });
      