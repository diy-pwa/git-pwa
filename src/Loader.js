import ZipLoader from "./ZipLoader.js";
import fs from 'fs';

export default class{
    constructor(init)
    {
        if (typeof (init) != "undefined") {
            Object.assign(this, init)
        }else{
            this.argv = process.argv;
            this.dest = "."
        }
        this.commands = {
            create: async ()=>{
                const oZipLoader = new ZipLoader();
                await oZipLoader.load("https://corsproxy-dqo.pages.dev/corsproxy/diy-pwa/coming-soon/zip/refs/heads/main", this.dest);
                await oZipLoader.unzip();
                fs.writeFileSync(`${this.dest}/components/DaysLeft.jsx`, 
`export default function(){
    let dFuture = new Date("${new Date(Date.now() + 12096e5).toISOString()}");
    let dNow = new Date();
    let nDifference = (dFuture - dNow)/(1000 * 3600 * 24);

    return <span>{Math.round(nDifference)}</span>
}`);

                return 0;
            },
            scrape: async ()=>{
                try{
                    var sUrl = this.argv[3].replace("://", "%3A%2F%2F");
                }catch(e){
                    console.log(`
usage:
    diy-pwa scraper <url to scrape from>
                    `);
                }
                const oZipLoader = new ZipLoader();
                await oZipLoader.load(`https://corsproxy-dqo.pages.dev/scraper/${sUrl}`, this.dest);
                await oZipLoader.unzip();
                return 0;
            }
        }
    }
    async runCommand(sCommandFolder){
        let nExitCode = 0;
        if(typeof(this.commands[this.argv[2]]) != "undefined"){
            nExitCode = await this.commands[this.argv[2]](sCommandFolder);
        }else{
            nExitCode = 2; //(not found I feel)
            console.log(`
usage:
    diy-pwa <command> <subcommand>
            `);
        }
        return nExitCode;
    }
}