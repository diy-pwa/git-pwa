import ZipLoader from "./ZipLoader.js";

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
                await oZipLoader.load("https://corsproxy-dqo.pages.dev/corsproxy/diy-pwa/coming-soon/archive/refs/heads/main.zip", this.dest);
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