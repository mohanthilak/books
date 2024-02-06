import express, {Application} from "express";
import expressApp from "./expressApp";
import {DBConnect} from "./database"
import {PORT} from "./config"
import { createClient } from 'redis';
export let redisClient:any;
if(process.env.NODE_ENV === 'docker-dev'){
    redisClient = createClient({
        url: 'redis://redis:6379'
    });
}else{
    redisClient = createClient();
}

const startServer = async () =>{
    try{
        const app = express();
        
        await DBConnect();    
    
        await connectRedis()

        redisClient.on("connect", ()=>{
            console.log("redis connected")
        })

        redisClient.on("error", (err: any)=>{
            console.log("redis error", err)
        })

        expressApp(app);
        

        app.listen(PORT, ()=> console.log(`ervin at port: ${PORT}`))

    }catch(e){
        console.log("!!!!!!!!!!!!!!!", e)
    }    
}

startServer();

async function connectRedis(){
    // let times = 5;
    // let jump =false;
    // while(times>0){
    //     try{
    //         await redisClient.connect();
    //         redisClient.on('connect', ()=>{
    //             jump = true;
    //             console.log("redis connected");
    //         })
    //         if (jump) break;
    //         redisClient.on('error', async (err) =>{
    //             console.log('Redis Client Error', err);
    //         })
    //     }catch(e){
    //         console.log("Error while connecting to redis", e);
    //         times--;
    //         await new Promise(res => setTimeout(res, 1000))

    //     }
        
    // }
    await redisClient.connect()

    redisClient.on("connect", ()=>{
        console.log("redis connected")
    })

    redisClient.on("error", (err: any)=>{
        console.log("redis error", err)
    })

} 
