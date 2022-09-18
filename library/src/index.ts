import express, {Application} from "express";
import expressApp from "./expressApp";
import {DBConnect} from "./database"
import {PORT} from "./config"
import {CreateChannel, SubscribeMessage} from "./utils"
import { createClient } from 'redis';
export const redisClient = createClient();


const startServer = async () =>{
    try{
        const app = express();
        
        await DBConnect();    
    
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect();

    const channel = await CreateChannel();

    await expressApp(app, channel);

    SubscribeMessage(channel);

    app.listen(PORT, ()=> console.log(`listening at port: ${PORT}`))

    }catch(e){
        console.log("!!!!!!!!!!!!!!!", e)
    }    
}

startServer();