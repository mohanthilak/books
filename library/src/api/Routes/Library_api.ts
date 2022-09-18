import {Application, Request, Response} from "express";
import {LibraryService} from "../../services";
import { auth } from "../Middlewares";
import { Library } from "../../database/Models";
import { Channel } from "amqplib";

const service = new LibraryService();

export const LibraryAPI = (app:Application, channel: Channel)=>{

    app.post("/library/create", auth, async (req: Request, res: Response)=>{

        if(req.user){
            const {location, name}: Partial<Library> = req.body;

            const data = await service.CreateLibrary({owner: req.user._id, location, name}, channel);
     
            if(data.err) return res.status(500).json({message: data.message});
                    
            return res.status(200).json(data.message);
            
        }

    })
    
    app.get("/library/find/:_id",async(req: Request, res: Response)=>{
        
        const {_id} = req.params;
        
        const data = await service.FetchLibraryData(_id);
        
        if(data.err) return res.status(data.message === "No Libraries found."?404:500).json({message: data.message})
        
        return res.status(200).json(data.data);
    })
}
