import {Book} from "../database/Models/Book"
import {BooksRepository, LibraryRepository} from "../database"
import {AddBooksAPIInterface} from "../dto" 



class BooksService{

    BooksRepo;
    LibraryRepo;

    constructor(){
        this.BooksRepo = new BooksRepository();
        this.LibraryRepo = new LibraryRepository();
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

}

export {BooksService}