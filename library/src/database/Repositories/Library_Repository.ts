import {Library, LibraryModel} from "../Models"

const errorMessage = "Error occured at Library Repository Layer";

class LibraryRepository{

    async CreateLibrary({owner, location, name}: Partial<Library>){

        try{
            const LibraryData = new LibraryModel({owner, location, name});
            await LibraryData.save()

            return {err: null, data:LibraryData, message: "Succefully Created yess"};
        }catch(e){
            console.log(errorMessage, e);
            
            return {err: e, data: null, message:"Server Error"};
        }

    }

    async AddBookToLibrary(bookId: string, libId: string){

        try{
            let library = await LibraryModel.findById(libId);
            
            if(library){
                library.books.push(bookId);
                await library.save();
                return {err: null, data: true, message: "Books Added successfully"}
            }

            return {err: true, data: null, message: "library not found"};
            
        }catch(e){
            console.log(errorMessage, e);
            
            return {err: e, data: null, message: "Server Error"};
        }

    }

    async FetchLibraryData(_id:string){
        try{
            const Libraries = await LibraryModel.findById(_id).select("books name owner location revenue").populate("books");
           
            if(Libraries) return {err: null, data: Libraries, message: "Successful"};
            return {err: true, data: null, message: "No Libraries found."}
            
        }catch(e){
            console.log(errorMessage, e);
            
            return {err: e, data: null, message:"Server Error"};
        }
    }
    
   
    
}

export {LibraryRepository};