import {Application, Request, Response} from "express";
import {BooksService} from "../../services"
import { auth } from "../Middlewares";
import { Channel } from "amqplib";

const services = new BooksService();

export const BooksAPI = (app:Application, channel: Channel)=>{
    

    app.post("/book/add/:lib_id", auth, async(req:Request, res:Response)=>{

        if(req.user){
            const {name, author, mrp, priceOfBorrowing, location} = req.body;
            const {lib_id} = req.params;

            const data = await services.CreateBook({name,location, author, mrp, priceOfBorrowing, library: lib_id, owner: req.user._id});
            
            if(data.err) return res.status(500).json({message: data.message})
            
            return res.status(200).json({message: data.message});
        }

    })
    

    app.post("/book/find/:_id", async (req: Request, res: Response)=>{
        
        const {_id} = req.params;

        const data = await services.GetBookDataById(_id);
        
        if(data.err) return res.status(data.message === "Book not Found"?404:500).json({message: data.message});

        return res.status(200).json({data: data.data, message: data.message});
    })


    app.get("/book/search/:stringInput/:latitude/:longitude", async(req:Request, res:Response)=>{
        
        const {stringInput, latitude, longitude} = req.params;

        const data = await services.GetSearchResultFromNameOrAuthor(stringInput,parseFloat(latitude), parseFloat(longitude) );
        
        if(data.err) return res.status(500).json({message: data.message});

        return res.status(200).json({data: data.data, message: data.message});
    })
    
    app.get("/book/owner/:id", async (req: Request, res: Response)=>{
        const data = await services.GetBookOwner(req.params.id);
        return res.json(data);
    })
}



