import { Channel } from "amqplib";
import { LibraryRepository } from "../database";
import { Library} from "../database/Models";
import {PublishMessage} from "../Infra/MeessageQueue/MessageQueue";
import {USER_BINDING_KEY, USER_EXCHANGE} from "../config"

class LibraryService{
    
    LibRepo;
    
    constructor(LB: LibraryRepository){
        this.LibRepo = LB;
    }
    
    async CreateLibrary({owner, location, name,city, state, about, address}: Partial<Library>, channel: Channel){

        try{
        const data = await this.LibRepo.CreateLibrary({owner, location, name, city, state, about, address});
        
        if(data.data && owner) PublishMessage(channel, USER_BINDING_KEY, JSON.stringify({operation:"AddLibraryToUser", data: {userId: owner, libraryId: data.data._id}}), USER_EXCHANGE)
        
        return data;
       }catch(e){
            console.log(e);

            return {err: e, data: null, message: "Server-Error"};
        }

    }

    async GetAllLibrariesWithUserID({uid}: {uid:string}){
        return this.LibRepo.GetAllLibrariesWithUserID({uid});
    }

    async FetchLibraryData(_id:string){
        return await this.LibRepo.FetchLibraryData(_id);
    }

    async GetAllLibraries() {
        return await this.LibRepo.GetAllLibraries();
    }

    async GetLibrariesWithLatAndLong({latitude, longitude} : {latitude:number, longitude:number}){
        return this.LibRepo.GetLibrariesWithLatAndLong({latitude, longitude});
    }

    async GetSearchResultFromLibraryName({searchText, latitude, longitude}: {searchText:string, latitude:number, longitude:number}){
        return this.LibRepo.GetSearchResultFromLibraryName({searchText, latitude, longitude});
    }
    
}

export {LibraryService};