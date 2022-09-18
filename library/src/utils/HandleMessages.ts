import {redisClient} from "../index"

export const HandleMessagesFromBroker = (data: any) =>{
    console.log("Data from Broker", data);
    console.log(data.operation)
    switch(data.operation){
        case "debar_user" : {
            console.log("debar_user Case");
            redisClient.setEx(data.data.uid, 15*60,data.data.accessToken);
            const redisFetch =  redisClient.get(data.data.uid);
            console.log("Redis Fetch: ", redisFetch);
            break;
        }
        default : console.log("Default Case");
    }
}