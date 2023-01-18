import jszip from "jszip";
import fetch from 'node-fetch';
import fs from 'fs';
import url from 'url';
import path from 'path';
export default class{
    async load(sPath, sDest){
        const oResponse = await fetch(sPath);
        const oBlob = await oResponse.blob();
        const oParsed = url.parse(sPath);
        const sOutfile = `${sDest}/${path.basename(oParsed.pathname)}`;
        let oBuffer = await oBlob.arrayBuffer();
        oBuffer = Buffer.from(oBuffer);
        try{
            await fs.promises.access(sDest);
        }catch{
            await fs.promises.mkdir(sDest, {recursive: true});
        }
        await fs.promises.writeFile(sOutfile, oBuffer);
        // move package.json out of the way if there is one
        try{
            await fs.promises.rename(`${sDest}/package.json`, `${sDest}/package.json.bak`)
        }catch{
        }
    }
    async unzip(sPath, sDest){
        const oParsed = url.parse(sPath);
        const sZipfile = `${sDest}/${path.basename(oParsed.pathname)}`;
        const oContent = fs.readFileSync(sZipfile);
        const oJsZip = new jszip();
        const oResult = await oJsZip.loadAsync(oContent);
        const oKeys = Object.keys(oResult.files);
        for(let key of oKeys){
            const oItem = oResult.files[key];
            const sRootPath = oItem.name.split('/').shift();
            const sPath = oItem.name.replace(sRootPath, '');
            if(oItem.dir){
                try{
                    await fs.promises.access(`${sDest}${sPath}`);
                }catch{
                    await fs.promises.mkdir(`${sDest}${sPath}`, {recursive: true});
                }
            }else{
                fs.writeFileSync(`${sDest}${sPath}`, Buffer.from(await oItem.async('arraybuffer')));
            }
        }
        await fs.promises.rm(sZipfile, { recursive: true, force: true });
    }
}