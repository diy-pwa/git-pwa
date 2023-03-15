import fetch from 'node-fetch';
import fs from 'fs';

export default class{
    constructor(init)
    {
        if (typeof (init) != "undefined") {
            Object.assign(this, init)
        }
    }
    async fetch(){
        this.init = {
            headers: {
                "Square-Version": "2023-01-19",
                "Authorization": `Bearer ${this.accessToken}`,
                "Content-Type": "application/json"
            },
        };
        let data = await fetch(`${this.baseUrl}/v2/catalog/list`, this.init);
        return this.catalogueList = await data.json();
    }
    async fetchImages(sFolder){
        if(!this.catalogueList){
            throw new Exception("must run SquareLoader.fetch() first");
        }
        let promises = [];
        for(let n = 0; n < this.catalogueList.objects.length; n++){
            const oObject = this.catalogueList.objects[n];
            for(let n = 0; n < oObject.item_data.image_ids.length; n++){
                const object_id = oObject.item_data.image_ids[n];
                const sUrl = `${this.baseUrl}/v2/catalog/object/${object_id}`;
                promises.push(fetch(sUrl, this.init));
            }
        }
        let responses = await Promise.all(promises);
        promises = [];
        for(let n = 0; n < responses.length; n++){
            let oResponse = responses[n];
            promises.push(oResponse.json());
        }
        let aImages = await Promise.all(promises);
        let aIds = [];
        let oImagesToSave = {};
        promises = [];
        for(let n=0; n < aImages.length; n++){
            const oImage = aImages[n].object;
            aIds.push(oImage.id);
            let oImageData = oImage.image_data;
            oImageData.updated_at = oImage.updated_at;
            oImagesToSave[oImage.id] = oImageData;
            promises.push(fetch(oImageData.url));
        }
        responses = await Promise.all(promises);
        promises = [];
        for(let n = 0; n < responses.length; n++){
            promises.push(responses[n].blob());
        }
        responses = await Promise.all(promises);
        promises = [];
        for(let n = 0; n < responses.length; n++){
            promises.push(responses[n].arrayBuffer());
        }
        responses = await Promise.all(promises);
        promises = [];
        if (!fs.existsSync(sFolder)) {
            fs.mkdirSync(sFolder, { recursive: true });
        }      
        for(let n = 0; n < responses.length; n++){
            const oImage = oImagesToSave[aIds[n]];
            promises.push(fs.promises.writeFile(`${sFolder}/${oImage.name}`, Buffer.from(responses[n])));
        }
        await Promise.all(promises);
        for(let n = 0; n < this.catalogueList.objects.length; n++){
            const oObject = this.catalogueList.objects[n];
            let aImageList = [];
            for(let n = 0; n < oObject.item_data.image_ids.length; n++){
                const object_id = oObject.item_data.image_ids[n];
                const oImage = oImagesToSave[object_id];
                aImageList.push(`${sFolder}/${oImage.name}`);
            }
            oObject.item_data.images = aImageList;
        }

    }
 

}