import fetch from 'node-fetch';

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
    async fetchImages(){
        if(!this.catalogueList){
            throw new Exception("must run SquareLoader.fetch() first");
        }
        let promises = [];
        for(let n = 0; n < this.catalogueList.objects.length; n++){
            for(const object_id in this.catalogueList.objects[n].item_data.image_ids){
                promises.push(fetch(`/v2/catalog/object/${object_id})`, this.init));
            }
        }
        let responses = await Promise.all(promises);
        promises = [];
        for(const response in responses){
            promises.push(response.json);
        }
        let aImages = await Promise.all(promises);
        for(oImage in aImages){

        }
    }
 

}