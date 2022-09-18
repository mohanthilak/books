import {UserRepository} from "../database/Repositories/User_Repository"

export const HandleMessagesFromBookService=(data:any)=>{
    console.log("Data at handle message from books service", data);
    const repo = new UserRepository();
    switch(data.operation){
        case "AddLibraryToUser": {
            console.log("AddLibraryToUser Case")
            repo.Addlibrary(data.data.userId, data.data.libraryId);
            break;
        }
        default: console.log("Default Case");
    }
}