import {Book} from "../database/Models/Book";
import {BooksRepository, LibraryRepository} from "../database"
import {RequestBorrowBookInterface,AddBooksAPIInterface} from "../dto" 
import { Channel } from "amqplib";
import { NOTIFICATION_BINDING_KEY, NOTIFICATION_EXCHANGE } from "../config";



class BooksService{
    
    BooksRepo;
    LibraryRepo;
    
    constructor(BR: BooksRepository, LB: LibraryRepository){
        this.BooksRepo = BR;
        this.LibraryRepo = LB;
    }
    
    async CreateBook(obj: AddBooksAPIInterface){
        
        const data = await this.BooksRepo.AddSingleBook(obj);
        
        if(!data.err && data.data){
            const libData = await this.LibraryRepo.AddBookToLibrary(data.data._id, obj.library);
            
            if(libData.data)
            return data;
        else
        return libData;
    }
    return data;
    
    }
    
    async CreateMultipleBooks(arr: Partial<Book>[]){
        return await this.BooksRepo.AddMultipleBooks(arr);
    }
    
    async GetBookDataById(_id: string){
        return await this.BooksRepo.BookDataById(_id);
    }
    
    async GetSearchResultFromNameOrAuthor(inputString:string, latitude:number, longitude: number){
        return await this.BooksRepo.GetBookFromNameOrAuthor(inputString, latitude, longitude)
    }
    
    async GetBookOwner(bookId:string){
        return await this.BooksRepo.GetOwner(bookId);
    }
    
    async InitiateBorrowRequest({ book_id, timestamp, uid}:RequestBorrowBookInterface, channel: Channel) {
        try{
            const repoResponse = await this.BooksRepo.BorrowRequest({book_id, timestamp, uid});
            if(repoResponse.success){
                channel.publish(NOTIFICATION_EXCHANGE, NOTIFICATION_BINDING_KEY, Buffer.from(JSON.stringify({fromService: "library", operation: "Notify-lender", data:{type:"all", message: {data: `A user has request for the book ${repoResponse.data?.name}`, lender:repoResponse.data?.owner, relatedUser: repoResponse.data?.borrowRequest[repoResponse.data?.borrowRequest.length-1]}}})))
            }
            return repoResponse;
        }catch(e){
            console.log("Error at Books service layer", e);
            return {success: false, data: null, error: e};
        }
    }
    GetAllBooks() {
        return this.BooksRepo.GetAllBooks();
    }
}

export {BooksService}