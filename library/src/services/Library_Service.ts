import { Channel } from "amqplib";
import { LibraryRepository } from "../database";
import { Library} from "../database/Models";
import {PublishMessage} from "../utils";
import {USER_BINDING_KEY, USER_EXCHANGE} from "../config"

class LibraryService{
    
    LibRepo;
    
    constructor(){
        this.LibRepo = new LibraryRepository();
    }

    async CreateLibrary({owner, location, name}: Partial<Library>, channel: Channel){

       try{
        const data = await this.LibRepo.CreateLibrary({owner, location, name});
        
        if(data.data && owner) PublishMessage(channel, USER_BINDING_KEY, JSON.stringify({operation:"AddLibraryToUser", data: {userId: owner, libraryId: data.data._id}}), USER_EXCHANGE)
        
        return data;
       }catch(e){
            console.log(e);

            return {err: e, data: null, message: "Server-Error"};
       }

    }

    async FetchLibraryData(_id:string){
        return await this.LibRepo.FetchLibraryData(_id);
    }

    
}

export {LibraryService};