import { RepositoryDependency, ServiceDependency } from "../../dependencyClass";
import {redisClient} from "../../index"

export const HandleMessagesFromBroker = async (data: any) =>{
    try {
        console.log("Data from Broker", data);
    console.log(data.operation)
    switch(data.operation){
        case "debar_user" : {
            console.log("debar_user Case", data.data.uid);
            console.log("type of id:", typeof(data.data.uid))
	        redisClient.setEx(data.data.uid, 15*60,data.data.accessToken);
            const redisFetch = await redisClient.get(data.data.uid);
            console.log("Redis Fetch: ", redisFetch);
            break;
        }
        default : console.log("Default Case");
    }
    }catch(e){
        console.log("Error at handling message", e)
    }
    
}


class MessageHandline{
    data: any;
    serviceDependency: ServiceDependency
    repoDependency: RepositoryDependency

    constructor(Sd: ServiceDependency, Rd: RepositoryDependency){
        this.serviceDependency = Sd;
        this.repoDependency = Rd;
    }

    public async HandleMessage (msg: any){
        this. data = msg;
        switch(this.data.operation){
            case "debar_user" : {
               this.DebarUser();
                break;
            }
            default : console.log("Default Case");
        }
    }
    private async DebarUser(){
        console.log("debar_user Case", this.data.data.uid);
        console.log("type of id:", typeof(this.data.data.uid))
        redisClient.setEx(this.data.data.uid, 15*60,this.data.data.accessToken);
        const redisFetch = await redisClient.get(this.data.data.uid);
        console.log("Redis Fetch: ", redisFetch);
    }
}

export {MessageHandline};