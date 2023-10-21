import {BookModel, Book, BorrowRequestModel} from "../Models";
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
            await BorrowRequest.save();

            const book = await BookModel.findById(book_id).populate('borrowRequest');
            if(book){
                const obj = {user: uid, timestamp}
                console.log(book)
                if(book.borrowRequest){
                    book.borrowRequest.push(BorrowRequest._id)
                }else{
                    book.borrowRequest = [BorrowRequest._id]
                }
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
            const book = new BookModel({location: obj.location, name: obj.name, author: obj.author, mrp: obj.mrp, priceOfBorrowing: obj.priceOfBorrowing, library: obj.library, owner: obj.owner});
            await book.save();

            return {err: null, data: book, message: "successful"};
        }catch(e){
            console.log(errorMessage, e);

            return {err: e, data: null, message: "Server Error"};
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

    async BookDataById(_id:string){
        
        try{
            const book = await BookModel.find({_id});
            if(book)
                return {err: null, data: book, message: "Successfull Found"};
            return {err: true, data: null, message: "Book not Found"}
        }catch(e){
            console.log(errorMessage, e);
            return {err: e, data: null, message: "Server Error"};
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

            return {err: null, data: list, message: list.length === 0 ? "No Match": `${list.length} results found`};
        }catch(e){
            console.log(errorMessage, e);

            return {err: e, data: null, message: "Server Error"};
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
}

export {BooksRepository};
