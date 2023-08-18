import { Channel } from "amqplib";
import {UserRepository} from "../database/Repositories/User_Repository"
import { RepositoryDependency, ServiceDependency } from "../dependencyClass";
import { GATEWAY_BINDING_KEY, GATEWAY_EXCHANGE } from "../config";


export const HandleMessagesFromBookService=(data:any)=>{
    console.log("Data at handle message from books service", data);
    const repo = new UserRepository();
    switch(data.operation){
        case "AddLibraryToUser": {
            console.log("AddLibraryToUser Case")
            repo.Addlibrary(data.data.userId, data.data.libraryId);
            break;
        }

        case "signup":{
            console.log("Signup Case");
            
        }
        default: console.log("Default Case");
    }
}

class MessageHandline {
    data: any;
    serviceDependecy: ServiceDependency
    repoDependency: RepositoryDependency
    channel: any

    constructor(channel: Channel,Sd: ServiceDependency, Rd: RepositoryDependency){
        this.channel = channel;
        this.serviceDependecy = Sd;
        this.repoDependency = Rd;
    }

     async HandleMessage(msg: any) {
        this.data = msg;
        switch(this.data.operation){
            case "AddLibraryToUser": {
                this.AddLibraryToUser()
                break;
            }

            case "trial":{
                this.handletrial();
                break;
            }
    
            case "signup":{
                console.log("Signup Case");
                break;
            }
            default: console.log("Default Case");
        }
    }



     private async AddLibraryToUser (){
        console.log("AddLibraryToUser Case")
        this.repoDependency.userRepo.Addlibrary(this.data.data.userId, this.data.data.libraryId);
    }

    private async handletrial(){
        try{
            console.log(this.data.requestID)
            const response = await this.repoDependency.userRepo.GetALLUsers();
            console.log("....", this.data.requestID)
            let obj = {response, statusCode:500, requestID: this.data.requestID}
            if(response?.success) {
                obj.statusCode = 200;
            }
            const reponseObj = JSON.stringify(obj);
            await this.channel.publish(GATEWAY_EXCHANGE, GATEWAY_BINDING_KEY, Buffer.from(reponseObj))
            console.log("Message Publishesd", this.data.requestID, "\n")
            // return this.data.requestID;
        }catch(e){
            console.log("error while publishing message:", e);
        }
    }
}

export {MessageHandline};