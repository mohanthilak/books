import { Channel } from "amqplib";
import { NOTIFICATION_BINDING_KEY, NOTIFICATION_EXCHANGE } from "../config";
import { BooksRepository, LibraryRepository } from "../database";
import { Book, BorrowRequest } from "../database/Models/Book";
import { AddBooksAPIInterface, RequestBorrowBookInterface } from "../dto";
import axios from "axios";



class BooksService{
    
    BooksRepo;
    LibraryRepo;
    
    constructor(BR: BooksRepository, LB: LibraryRepository){
        this.BooksRepo = BR;
        this.LibraryRepo = LB;
    }
    
    private GetPathsFromImagesObjArray(arr:any): string[]|null{
        if(arr.length<0) return null;
        const photosPathArray: string[] = [];
        arr.forEach((el: any) => {
            photosPathArray.push(el.path);
        });
        return photosPathArray;
    }

    async CreateBook(obj: AddBooksAPIInterface){
        obj.photos = this.GetPathsFromImagesObjArray(obj.photos);
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


    async GetBookDetailsForBorrower({id}: {id: string}){
        return this.BooksRepo.GetBookDataByIDForBorrower({id});
    }
    
    async GetBookDataById(_id: string){
        const bookData = await this.BooksRepo.BookDataById(_id);
        if (bookData.success && bookData.data && bookData.data.borrowRequest.length > 0) {
            let borroweres = bookData.data.borrowRequest as BorrowRequest[]
            let ids = borroweres.map(e=>e.user)
            let hydratedBorroweres:any;
            await axios.post("http://localhost:4001/internal/get-users-with-ids",{ids}).then(res=>{
                if(res.data.success){
                    hydratedBorroweres = res.data.data;
                    hydratedBorroweres.forEach((el: any) => {
                        let timestamp, state;
                        borroweres.forEach(e=>{
                            if(e.user==el._id){
                                el.timestamp= e.timestamp;
                                const _id = el._id
                                el.user = _id;
                                el._id = e._id
                                return;
                            }
                        })
                        // console.log("timestamp:", timestamp, state)
                    });
                }
            }).catch(e=>{
                console.log("error while requesting for user details;", e)
            });
            return {...bookData, data: {...bookData.data, borrowRequest: hydratedBorroweres}}
        }else return bookData
    }
    
    async GetSearchResultFromNameOrAuthor(inputString:string, latitude:number, longitude: number){
        return await this.BooksRepo.GetBookFromNameOrAuthor(inputString, latitude, longitude)
    }

    async GetNearestBooksAndUserFavs({latitude, longitude}: {latitude:number, longitude:number}){
        return await this.BooksRepo.GetNearestBooksAndUserFavs({latitude, longitude});
    }
    
    async GetBookOwner(bookId:string){
        return await this.BooksRepo.GetOwner(bookId);
    }
    
    async InitiateBorrowRequest({ book_id, timestamp, uid}:RequestBorrowBookInterface, channel: Channel) {
        try{
            const repoResponse = await this.BooksRepo.BorrowRequest({book_id, timestamp, uid});
            if(repoResponse.success){
                console.log("sending message to notification service!")
                channel.publish(NOTIFICATION_EXCHANGE, NOTIFICATION_BINDING_KEY, Buffer.from(JSON.stringify({fromService: "library", operation: "Notify-lender", data:{type:"all", message: {data: `A user has requested for the book ${repoResponse.data?.name}`, lender:repoResponse.data?.owner, relatedUser: repoResponse.data?.borrowRequest[repoResponse.data?.borrowRequest.length-1]}}})))
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

    async IssueBook({requestID, issuedTo, bookID}: {requestID:string, issuedTo:string, bookID: string}){
        return this.BooksRepo.IssueBook({requestID, issuedTo, bookID});
    }
}

export { BooksService };
