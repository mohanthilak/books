import {Application, Request, Response} from "express";
import {BooksService} from "../../services"
import { auth } from "../Middlewares";
import { Channel } from "amqplib";
import { ServiceDependency } from "../../dependencyClass";


export const BooksAPI = (app:Application, channel: Channel, service: ServiceDependency)=>{

    app.get('/book/all', async(req, res)=>{
        try{
            const books = await service.booksService.GetAllBooks();
            return res.status(200).json(books)
        }catch(e){
            console.log("Error at Book Repository Layer", e);
            return {success: false, data: null, error: e};
        }
    })
    

    app.post("/book/add/:lib_id", auth, async(req:Request, res:Response)=>{

        if(req.user){
            const {name, author, mrp, priceOfBorrowing, location} = req.body;
            const {lib_id} = req.params;

            const data = await service.booksService.CreateBook({name,location, author, mrp, priceOfBorrowing, library: lib_id, owner: req.user._id});
            
            if(data.err) return res.status(500).json({message: data.message})
            
            return res.status(200).json({message: data.message});
        }

    })
    

    app.post("/book/find/:_id", async (req: Request, res: Response)=>{
        
        const {_id} = req.params;

        const data = await service.booksService.GetBookDataById(_id);
        
        if(data.err) return res.status(data.message === "Book not Found"?404:500).json({message: data.message});

        return res.status(200).json({data: data.data, message: data.message});
    })


    app.get("/book/search/:stringInput/:latitude/:longitude", async(req:Request, res:Response)=>{
        
        const {stringInput, latitude, longitude} = req.params;

        const data = await service.booksService.GetSearchResultFromNameOrAuthor(stringInput,parseFloat(latitude), parseFloat(longitude) );
        
        if(data.err) return res.status(500).json({message: data.message});

        return res.status(200).json({data: data.data, message: data.message});
    })

    app.post("/book/request-borrow", auth, async(req: Request, res: Response)=>{
        try{
            const {book_id, timestamp} = req.body;
            console.log(req.user)
            const data = await service.booksService.InitiateBorrowRequest({book_id, timestamp, uid: <string>req.user?._id}, channel);
            return res.json(data)
        }catch(e){
            console.log("Error while handling the request borrow request", e);
            return res.status(500).json({success: false, data: null, message: e})
        }
    })
    
    app.get("/book/owner/:id", async (req: Request, res: Response)=>{
        const data = await service.booksService.GetBookOwner(req.params.id);
        return res.json(data);
    })
}



