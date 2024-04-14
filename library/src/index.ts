import express, {Application} from "express";
import expressApp from "./expressApp";
import {DBConnect} from "./database"
import {PORT, REDIS_PASSWORD, REDIS_URL} from "./config"
import { createClient } from 'redis';
export let redisClient:any;

const startServer = async () =>{
    try{
        const app = express();
        
        await DBConnect();    
    
        await connectRedis()

        // redisClient.on("connect", ()=>{
        //     console.log("redis connected")
        // })

        // redisClient.on("error", (err: any)=>{
        //     console.log("redis error", err)
        // })

        expressApp(app);
        

        app.listen(PORT, ()=> console.log(`Servin at port: ${PORT}`))

    }catch(e){
        console.log("Could not starr the server")
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
    try{
        if(process.env.NODE_ENV === 'docker-dev'){
            redisClient = createClient({
                url: 'redis://redis:6379'
            });
        }else if(process.env.NODE_ENV == "production" || process.env.NODE_ENV == "render"){
            redisClient = await createClient({
                url: "redis://"+REDIS_URL,
                password: REDIS_PASSWORD
            })
        }else{
            redisClient = await createClient();
        }
        await redisClient.connect()
    }catch(e){
        console.log("Could Not connect to Redis:", e);
        throw e;
    }

    redisClient.on("connect", ()=>{
        console.log("redis connected")
    })

    redisClient.on("error", (err: any)=>{
        console.log("redis error", err)
    })

} 
