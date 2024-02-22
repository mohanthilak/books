import {Application, Request, Response} from "express";
import {BooksService} from "../../services"
import { auth } from "../Middlewares";
import { Channel } from "amqplib";
import { ServiceDependency } from "../../dependencyClass";
import { USER_BINDING_KEY, USER_EXCHANGE } from "../../config";
import multer from "multer";
import { storage } from "../../config/cloudinary";
// const upload = multer({ dest: 'uploads/' });
const upload = multer({ storage});


export const BooksAPI = (app:Application, channel: Channel, service: ServiceDependency)=>{

    app.get("/book/trial", (req, res) =>{
        try{
            channel.publish(USER_EXCHANGE, USER_BINDING_KEY, Buffer.from(JSON.stringify({operation:"Trial", fromService: "user-service", data: {date: Date.now()}})))
            return res.status(200).json({success: true, error:null, data: null})
        }catch(e){
            console.log("Error at Book Repository Layer", e);
            return {success: false, data: null, error: e};
        }
    })

    app.get('/book/all', async(req, res)=>{
        try{
            const books = await service.booksService.GetAllBooks();
            return res.status(200).json(books)
        }catch(e){
            console.log("Error at Book Repository Layer", e);
            return {success: false, data: null, error: e};
        }
    })
    

    app.post("/book/add/:lib_id",auth, upload.fields([{ name: 'firstPage', maxCount: 1 },{ name: 'front', maxCount: 1 }, { name: 'back', maxCount: 1 }]), async(req:Request, res:Response)=>{
        try {
            if(req.user){
                const files = req.files as { [fieldname: string]: Express.Multer.File[] };
                const {name, author, mrp, priceOfBorrowing, location, about} = JSON.parse(req.body.data);
                const {lib_id} = req.params;
                const payload = {name,location, author, mrp, priceOfBorrowing, library: lib_id, owner: req.user._id, about, photos: [files["front"][0],files["firstPage"][0], files["back"][0]]}
                const data = await service.booksService.CreateBook(payload);
                
                if(data.err) return res.status(500).json(data)
                
                return res.status(200).json(data);
            }
        } catch (e) {
            console.log(e);
            return res.status(200).json({success: false, data: null, error: e})
        }
    })
    

    app.get("/book/:_id", async (req: Request, res: Response)=>{
        
        const {_id} = req.params;

        const data = await service.booksService.GetBookDataById(_id);
        
        if(data.error) return res.status(data.message === "Book not Found"?404:500).json({message: data.message});

        return res.status(200).json(data);
    })
    
    app.get("/book/borrower/:id", async (req: Request, res: Response)=>{
        
        const {id} = req.params;

        const data = await service.booksService.GetBookDetailsForBorrower({id});
        
        return res.status(data.success?200:404).json(data);
    })


    app.get("/book/search/:searchText/:longitude/:latitude", async(req:Request, res:Response)=>{
        
        const {searchText, latitude, longitude} = req.params;

        const booksData = await service.booksService.GetSearchResultFromNameOrAuthor(searchText,parseFloat(latitude), parseFloat(longitude) );
        const libsData = await service.libraryService.GetSearchResultFromLibraryName({searchText, latitude: parseFloat(latitude), longitude: parseFloat(longitude)});
        const data = {libraries: libsData.data , books: booksData.data}
        return res.status(booksData || libsData ? booksData && libsData ? 200 :207 : 500).json({success: booksData || libsData ? true : false, data, error: null})
    })
    
    
    app.get("/book/menupage/:latitude/:longitude", async(req:Request, res:Response)=>{
        
        const {latitude, longitude} = req.params;

        const data = await service.booksService.GetNearestBooksAndUserFavs({latitude:parseFloat(latitude), longitude:parseFloat(longitude) });
        
        if(data.err) return res.status(500).json(data);

        return res.status(200).json(data);
    })

    app.post("/book/request-borrow", auth, async(req: Request, res: Response)=>{
        try{
            const {book_id, timestamp} = req.body;
            console.log(req.user)
            const data = await service.booksService.InitiateBorrowRequest({book_id, timestamp, uid: <string>req.user?._id}, channel);
            
            return res.status(200).json(data)
        }catch(e){
            console.log("Error while handling the request borrow request", e);
            return res.status(500).json({success: false, data: null, message: e})
        }
    })
    
    app.get("/book/owner/:id", async (req: Request, res: Response)=>{
        const data = await service.booksService.GetBookOwner(req.params.id);
        return res.json(data);
    })

    app.post("/book/issue-book", auth, async (req:Request, res: Response)=>{
        const {requestID, issuedTo, bookID} = req.body;
        try {
            const data = await service.booksService.IssueBook({requestID, issuedTo, bookID})
            const statusCode = data.success ? 200 : 401;
            return res.status(statusCode).json(data);
        } catch (e) {
            console.log("Error while updating request status:", e);
            return res.status(500).json({success: false, data: null, error: e});
        }  
    })
    app.get("/book/notification-queue-test/:offset", (req:Request, res:Response)=>{
        const {offset} = req.params;
        service.booksService.SendDummyQueueDataToNotificationService(parseInt(offset), channel)
        return res.json({success: true, data: null, error: null});
    })
}



