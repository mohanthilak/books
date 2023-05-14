import {redisClient} from "../index"

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
