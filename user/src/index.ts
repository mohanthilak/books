import express from 'express';
import expressApp from "./expressApp";
import {DBConnect} from "./database"
import {PORT} from "./config"
import {CreateChannel} from "./utils"

const startServer = async () =>{
    try{
        await DBConnect();
        const channel = await CreateChannel();
        
        const app = express();
        
        expressApp(app, channel);

        app.listen(PORT, ()=> console.log(`listening at port: ${PORT}`));
    }catch(e){
        console.log("??????????????????", e)
    }
}

startServer();