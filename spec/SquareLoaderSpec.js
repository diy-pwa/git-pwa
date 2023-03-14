import SquareLoader from "../src/SquareLoader.js";
import fs from 'fs';
import oCreds from './creds.json' assert { type: "json" };

beforeEach(async()=>{
    await fs.promises.rm("test", { recursive: true, force: true });
});

describe("Square loader is to load from", () => {
    it("downloads a .list of products", async () => {
        let oSquareLoader = new SquareLoader({accessToken:oCreds.accessToken, baseUrl:"https://connect.squareupsandbox.com"});
        const oCatalogue = await oSquareLoader.fetch();
        expect(oCatalogue.objects.length).toBeGreaterThan(0);
    });
    it("fetches product images", async ()=>{
        let oSquareLoader = new SquareLoader({accessToken:oCreds.accessToken, baseUrl:"https://connect.squareupsandbox.com"});
        const oCatalogue = await oSquareLoader.fetch();
        await oSquareLoader.fetchImages("test");
        expect(fs.existsSync("test/productImages")).toBe(true);
    });
});