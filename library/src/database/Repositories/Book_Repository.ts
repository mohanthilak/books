import {BookModel, Book, BorrowRequestModel, BorrowRequest} from "../Models";
import {AddBooksAPIInterface, RequestBorrowBookInterface} from "../../dto"

const errorMessage = "Error occured at Books Repository Layer: ";

class BooksRepository{

    async GetAllBooks() {
        try{
            const books = await BookModel.find({}).lean();
            return {success: true, data: books, error: null};
        }catch(e){
            console.log("Error at Books Repository layer", e);
            return {success: false, data: null, error: e};
        }
    }
    async BorrowRequest({ book_id, timestamp, uid }:RequestBorrowBookInterface) {
        try{
            const BorrowRequest = new BorrowRequestModel({user: uid, timestamp});
            
            const book = await BookModel.findById(book_id).populate('borrowRequest');
            if(book){
                const obj = {user: uid, timestamp}
                if(book.borrowRequest){
                    const requests = book.borrowRequest as BorrowRequest[]
                    for (let index = 0; index < requests.length; index++) {
                        if(requests[index]?.user === uid){
                            return {success: false, data: null, error: "Already Request"}
                        }
                    }
                    book.borrowRequest.push(BorrowRequest._id)
                }else{
                    book.borrowRequest = [BorrowRequest._id]
                }
                await BorrowRequest.save();
                await book.save();
                book.borrowRequest[book.borrowRequest.length-1] = BorrowRequest;

                return {success: true, data: book, error: null}
            } else{
                return {success: false, data: null, error: "Book ID invalid"}
            }
        }catch(e){
            console.log('Error at Books Repository', e);
            return {success: false, data: null, error: e};
        }
    }


    async AddSingleBook(obj: AddBooksAPIInterface){

        try{
            const book = new BookModel({about: obj.about, location: obj.location, name: obj.name, author: obj.author, mrp: obj.mrp, priceOfBorrowing: obj.priceOfBorrowing, library: obj.library, owner: obj.owner, photos: obj.photos});
            await book.save();

            return {err: null, success: true, data: book, message: "successful"};
        }catch(e){
            console.log(errorMessage, e);

            return {err: e, data: null, success: false, message: "Server Error"};
        }

    }

    async AddMultipleBooks(objs: Partial<Book>[]){
        try{
            const books = await BookModel.insertMany(objs, {lean: true});

            return {err: null, data: books, message: "Successfully Inserted"}
        }catch(e){
            console.log(errorMessage, e);
            
            return {err: e, data: null, message: "Server Error"};
        }

    }

    async GetBookDataByIDForBorrower({id}: {id: string}){
        try {
            const book = await BookModel.findById(id).populate('library borrowRequest').lean();
            return {success: true, data:book, error: null}
        } catch (e) {
            console.log("Error while getting book details by id for borrower from BookRepo layer:", e);
            return {success: false, data: null, error: e}
        }
    }

    async BookDataById(id:string){
        try{
            const book = await BookModel.findById(id).populate('library borrowRequest').lean();
            if(book)
                return {success: true, error: null, data: book, message: "Successfull Found"};
            return {success: false, error: true, data: null, message: "Book not Found"}
        }catch(e){
            console.log(errorMessage, e);
            return {success: false, error: e, data: null, message: "Server Error"};
        }
    }

    async GetBookFromNameOrAuthor(inputString:string, latitude: number, longitude: number){

        try{
            const list = await BookModel.aggregate([
                {
                    $geoNear:{
                        near: {type:"Point", coordinates:[longitude,latitude]},
                        key: "location",
                        maxDistance: 1000*1000,
                        distanceMultiplier: 1 / 1000,
                        distanceField: "dist.calculated",
                        spherical: true
                    }
                },
                {
                    $match: {$or: [
                        {'name': {"$regex":inputString, "$options": "i"}}, {'author': {'$regex': inputString, "$options": "i"}}
                    ]}
                },
                { $addFields: { userObjectId: { $toObjectId: "$library" }}},
                {$lookup: {
                    from: "libraries",
                    localField: "userObjectId",
                    foreignField: "_id",
                    as: "library"
                  }}
            ])

            return {err: null, data: list,success: true, message: list.length === 0 ? "No Match": `${list.length} results found`};
        }catch(e){
            console.log(errorMessage, e);

            return {err: e, data: null, success: true,message: "Server Error"};
        }
    }
    
    async GetNearestBooksAndUserFavs({latitude, longitude}: {latitude: number, longitude: number}){

        try{
            console.log("\n\n\n", {latitude, longitude}, "\n\n\n")
            const list = await BookModel.aggregate([
                {
                    $geoNear:{
                        near: {type:"Point", coordinates:[longitude,latitude]},
                        key: "location",
                        maxDistance: 1000000,
                        distanceMultiplier: 1 / 1000,
                        distanceField: "dist.calculated",
                        spherical: true
                    }
                },
                // {
                //     $match: {$or: [
                //         {'name': {"$regex":inputString, "$options": "i"}}, {'author': {'$regex': inputString, "$options": "i"}}
                //     ]}
                // },
                { $addFields: { userObjectId: { $toObjectId: "$library" }}},
                {$lookup: {
                    from: "libraries",
                    localField: "userObjectId",
                    foreignField: "_id",
                    as: "library"
                  }}
            ])

            return {success:true, err: null, data: list, message: list.length === 0 ? "No Match": `${list.length} results found`};
        }catch(e){
            console.log(errorMessage, e);

            return {success: false, err: e, data: null, message: "Server Error"};
        }
    }

    async GetOwner(bookId:string){
        
        try{
            const data = await BookModel.findById(bookId).populate("owner");

            return {err:null, data, message:"Queary Successful"};
        }catch(e){
            console.log(errorMessage, e);
            return {err: e, data: null, message: "Server Error"};
        }
    }

    async IssueBook({requestID, issuedTo, bookID}:{requestID: string, issuedTo: string, bookID: string}){
        try {
            const book = await BookModel.findById(bookID);
            if(!book) return {success: false, data: null, error: "invalid BookID"};
            
            if(book.isIssued || book.isBorrowed) return {success: false, error: `book already ${book.isIssued ? "issued": "borrowed"}`}

            const borrowRequeset = await BorrowRequestModel.findOneAndDelete({_id: requestID, user: issuedTo});
            if(!borrowRequeset) return {success: false, data: null, error: "invalid requestID/BorrowerID"};


            book.isIssued = true;
            book.issuesTo = issuedTo
            book.save();

            return {success: true, data: book, error: null};
        } catch (e) {
            console.log(errorMessage, e);
            return {err: e, data: null, message: "Server Error"};
        }
    }
}

export {BooksRepository};
