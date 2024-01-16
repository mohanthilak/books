import {Application, Request, Response} from "express";
import {LibraryService} from "../../services";
import { auth } from "../Middlewares";
import { Library } from "../../database/Models";
import { Channel } from "amqplib";
import { ServiceDependency } from "../../dependencyClass";

export const LibraryAPI = (app:Application, channel: Channel, service: ServiceDependency)=>{

    app.post("/library/create", auth, async (req: Request, res: Response)=>{
        
        if(req.user){
            const {location, name, city, state, about, address}: Partial<Library> = req.body;
            const data = await service.libraryService.CreateLibrary({owner: req.user._id, location, name, city, state, about, address}, channel);
            console.log(data)
     
            if(data.err) return res.status(500).json({message: data.message});
                    
            return res.status(200).json(data);   
        }
    })

    app.get("/library/uid/:uid", async(req:Request, res: Response)=>{
        try{
            const uid:string = req.params.uid;
            if(!uid) return res.status(404).json({success: false, data: null, error: "No UID"})
            const lilbraries = await service.libraryService.GetAllLibrariesWithUserID({uid});
            console.log(lilbraries)
            return res.status(200).json(lilbraries)
        }catch(e){
            console.log("Error while handling get all libraries request", e);
            return res.status(500).json({success: false, data: null, error: e})
        }
    })
    
    app.get("/library/find/:_id",async(req: Request, res: Response)=>{
        
        const {_id} = req.params;
        
        const data = await service.libraryService.FetchLibraryData(_id);
        
        return res.status(data.success ? 200 : 400).json(data);
    })

    app.get("/library/all", async(req:Request, res: Response)=>{
        try{
            const lilbraries = await service.libraryService.GetAllLibraries();
            return res.status(200).json(lilbraries)
        }catch(e){
            console.log("Error while handling get all libraries request", e);
            return res.status(500).json({success: false, data: null, error: e})
        }
    })

    app.get("/library/find/:latitude/:longitude", async(req: Request, res: Response)=> {
        try {
            const {latitude, longitude} = req.params;
            
            const librariesData = await service.libraryService.GetLibrariesWithLatAndLong({latitude: parseFloat(latitude), longitude: parseFloat(longitude)});
            return res.status(librariesData.success ? 200 : 400).json(librariesData) 
        } catch (error) {
            console.log("error while handling find library by lat and long:", error);
            return res.status(500).json({success: false, data: null, error})
        }
    })
}
