import { Channel } from "amqplib";
import { NOTIFICATION_BINDING_KEY, NOTIFICATION_EXCHANGE } from "../config";
import { BooksRepository, LibraryRepository } from "../database";
import { Book, BorrowRequest } from "../database/Models/Book";
import { AddBooksAPIInterface, RequestBorrowBookInterface } from "../dto";
import axios from "axios";
import { USER_SERVICE_URL } from "../config";


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
            await axios.post(`${USER_SERVICE_URL}/internal/get-users-with-ids`,{ids}).then(res=>{
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
    private async CheckSufficientDeposit({book_id, uid}:{book_id: string, uid: string}){
        try {
            const BookDetails = await this.GetBookDetailsForBorrower({id: book_id});
            if(!BookDetails.success) return BookDetails;
            const priceOfBorrowing = BookDetails.data?.priceOfBorrowing as number;
            
            let response
            await axios.get(`${USER_SERVICE_URL}/wallet/internal/${uid}`).then(res=>{
                const {data} = res.data;
                if(!data) return res.data
                const deposit = data.amount;
    
                if(priceOfBorrowing > deposit) response = {success: false, data: null, error:"Inssufficient Deposit"};
                response =  {success: true, data: null, error: null};
            }).catch(err=>{
                console.log("axios error", err)
                if(err.response?.data) response = err.response.data
                else response = {success: false, data:null, error: err}
            })
            return response
        } catch (error) {
            console.log("error while checking the deposit in book service layer:", error);
            return {success: false, data: null, error}
        }
    }
    
    async InitiateBorrowRequest({ book_id, timestamp, uid}:RequestBorrowBookInterface, channel: Channel) {
        try{
            const userDeposit = await this.CheckSufficientDeposit({book_id, uid});
            if(!userDeposit?.success) return userDeposit;

            const repoResponse = await this.BooksRepo.BorrowRequest({book_id, timestamp, uid});
            if(repoResponse.success){
                console.log("sending message to notification service!")
                channel.publish(NOTIFICATION_EXCHANGE, NOTIFICATION_BINDING_KEY, Buffer.from(JSON.stringify({fromService: "library", operation: "Notify-lender-borrow", data:{type:"all", message: {data: `A user has requested for the book ${repoResponse.data?.name}`, lender:repoResponse.data?.owner, relatedUser: repoResponse.data?.borrowRequest[repoResponse.data?.borrowRequest.length-1]}}})))
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


    async SendDummyQueueDataToNotificationService(offset: number, channel: Channel){
        for (let i = 0; i < offset; i++) {
            channel.publish(NOTIFICATION_EXCHANGE, NOTIFICATION_BINDING_KEY, Buffer.from(JSON.stringify({fromService: "library", operation: "Test Receiving"})), {priority:1})
            // channel.publish(NOTIFICATION_EXCHANGE, NOTIFICATION_BINDING_KEY, Buffer.from(JSON.stringify({fromService: "library", operation: "Test Receiving High Priority Message"})), {priority: 3})

        }
        for(let i = 0; i<offset; i++){
            channel.publish(NOTIFICATION_EXCHANGE, NOTIFICATION_BINDING_KEY, Buffer.from(JSON.stringify({fromService: "library", operation: "Test Receiving High Priority Message"})), {priority: 3})
            
        }
    }
}

export { BooksService };
