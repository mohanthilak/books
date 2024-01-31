import express from 'express';
import expressApp from "./expressApp";
import {DBConnect} from "./database"
import {PORT} from "./config"

const startServer = async () =>{
    try{
        await DBConnect();
        
        const app = express();
        
        expressApp(app);

        app.listen(PORT, ()=> console.log(`listening at port: ${PORT}`));
    }catch(e){
        console.log("Error while starting the server", e)
    }
}

startServer()