import path from 'path';

const oStatCache = {};

class Stat{
    constructor(init){
        if (typeof init != 'undefined') {
            Object.assign(this, init);
            if(!this.path){
                throw "needs path";
            }
            if(!this.promises){
                throw "needs promises";
            }
        }else{
            throw "needs path and promises";
        }
    }
    async fileWatcher(event, filename){
        // need to watch folders for updates
        if(this.dirname != "."){
            filename = `${this.dirname}/${filename}`;        
        }
        console.log(`file changed ${filename}`)
        const oFile = oStatCache[filename];
        if(!oFile){
            oStatCache[filename] = new Stat({path:filename, promises: this.promises});
            oStatCache[filename].enCache(filename);
        }else{
            if(event=="rename"){
                oFile._ctime = new Date();
            }else{
                oFile._mtime = new Date();
            }
            const aBytes = await this.promises.readFile(filename);
            oFile._size = aBytes.length;                        
        }
    }
    async enCache(sPath){
        try{
            const oFile = await this.promises.readdir(sPath);
            this._isDirectory = true;
            this.promises.fs.watch(sPath, {}, this.fileWatcher.bind({dirname: sPath, promises: this.promises}));
        }catch{
            this._isDirectory = false;
            try{
                const aBytes = await this.promises.readFile(sPath);
                this._size = aBytes.length;
            }catch{
                let err = new Error('cannot stat');
                err.code =  'ENOENT';
                err.errno = -2;
                throw err;
            }
            
            this._mtime = this._ctime = new Date();
            // need to encache path leading up
            const sDir = path.dirname(sPath);
            if(!oStatCache["."]){
                this.enCache(".");
            }    
            if(!oStatCache[sDir]){
                this.enCache(sDir);
            }    
        }
    }
    isDirectory(){
        return this._isDirectory;
    }
    isFile(){
        return !this._isDirectory;
    }
    isSymbolicLink(){
        return false;
    }
    get size(){
        return this._size;
    }
    get mtime(){
        return this._mtime;
    }
    get ctime(){
        return this._ctime;
    }
    snapshot(){
        return Object.create(Object.getPrototypeOf(this), Object.getOwnPropertyDescriptors(this))
    }
}

export default class {
    constructor(init) {
        if (typeof init != 'undefined') {
            Object.assign(this, init);
        }
        this.readFile = this.fs.readFile.bind(this.fs);
//        this.writeFile = this.fs.writeFile.bind(this.fs);
        this.unlink = this.fs.rm.bind(this.fs);
        this.readdir = this.fs.readdir.bind(this.fs);
        this.mkdir = this.fs.mkdir.bind(this.fs);
        this.rm = this.fs.rm.bind(this.fs);
        this.lstat = this.stat.bind(this);
        this.stat = this.stat.bind(this);
        this.rmdir = this.rmdir.bind(this);
        this.symlink = this.symlink.bind(this);
        this.readlink = this.readlink.bind(this);
    }
    async writeFile(sPath, oContents, oOptions){
        const writeFile = this.fs.writeFile.bind(this.fs);
        return writeFile(sPath, oContents, oOptions);
    }
    async rmdir(sPath, oOptions){
        const options = Object.assign({recursive:true}, oOptions);
        const rmdir = this.fs.rm.bind(this.fs);
        return await rmdir(sPath, options);
    }
    async stat(sPath){
        if(!oStatCache[sPath]){
            oStatCache[sPath] = new Stat({path:sPath, promises:this});
            await oStatCache[sPath].enCache(sPath);
        }
        return oStatCache[sPath];
    }
    async symlink(sTarget, sPath){
        throw `unimplemented symlink ${sTarget}, ${sPath}`;
    }
    async readlink(sPath){
        throw `unimplemented readlink ${sPath}`;
    }
}