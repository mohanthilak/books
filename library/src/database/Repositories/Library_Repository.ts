import {Library, LibraryModel} from "../Models"

const errorMessage = "Error occured at Library Repository Layer";

class LibraryRepository{
    
    async CreateLibrary({owner, location, name, city, state, about, address}: Partial<Library>){

        try{
            const LibraryData = new LibraryModel({owner, location, name, city, state, about, address});
            await LibraryData.save()

            return { success: true, err: null, data:LibraryData, message: "Succefully Created yess"};
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
            const Libraries = await LibraryModel.findById(_id).populate("books");
            // const Libraries = await LibraryModel.findById(_id).select("books name owner location revenue").populate("books");
           
            if(Libraries) return {error: null, data: Libraries, success:true};
            return {error: true, data: null, success:false}
            
        }catch(e){
            console.log(errorMessage, e);
            
            return {error: e, data: null, success:false};
        }
    }

    async GetAllLibrariesWithUserID({uid}: {uid:string}){
        try{
            const libraries = await LibraryModel.find({owner:uid}).populate({path:'books', populate:{path:'borrowRequest'}}).lean();
            return {success: true, data: libraries, error: null}
        }catch(e){
            console.log('Error while fetching libraries with userID', e);
            return {success: false, data: null, error: e}
        }
    }
    
    async GetAllLibraries() {
        try{
            const libraries = await LibraryModel.find({}).populate('books');
            return {success: true, data: libraries, error:null}
        }catch(e){
            console.log('Error at library repository layer', e);
            return {success: false, data: null, error: e}
        }
    }
    
    async GetLibrariesWithLatAndLong({latitude, longitude} : {latitude:number, longitude:number}){
        try {
            const libraries = await LibraryModel.aggregate([
                {
                    $geoNear: {
                        near: {type:"Point", coordinates:[latitude,longitude]},
                        key: "location",
                        maxDistance: 1000*1000,
                        distanceMultiplier: 1 / 1000,
                        distanceField: "dist.calculated",
                        spherical: true
                    }
                },
                {
                    $addFields:{
                        photo: {$toObjectId: {$first: '$books'}}
                    }
                },
                {
                    $lookup: {
                        from: 'books',
                        localField: 'photo',
                        foreignField: '_id',
                        as: 'books',
                    },
                },
                
                {
                    $unwind: '$books',
                },
                {
                    $set: {
                        "photo": {$first: "$books.photos"}
                    }
                },
                { 
                    $project: {
                        books: 0 
                    } 
                }
                
            ])
            return {success:true, data:libraries, error: null};
        } catch (error) {
            console.log('error while getting libraries with lat and long from db:', error);
            return {success: false, data: null, error}
        }
    }

    async GetSearchResultFromLibraryName({searchText, latitude, longitude}:{searchText:string, latitude:number, longitude:number}){
        try {
            const libraries = await LibraryModel.aggregate([
                {
                    $geoNear: {
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
                        {'name': {"$regex":searchText, "$options": "i"}}
                    ]}
                },
                {
                    $addFields:{
                        photo: {$toObjectId: {$first: '$books'}}
                    }
                },
                {
                    $lookup: {
                        from: 'books',
                        localField: 'photo',
                        foreignField: '_id',
                        as: 'books',
                    },
                },
                
                {
                    $unwind: '$books',
                },
                {
                    $set: {
                        "photo": {$first: "$books.photos"}
                    }
                },
                { 
                    $project: {
                        books: 0 
                    } 
                }
            ]);
            console.log('libraries:', libraries)
            return {success: true, data: libraries, error: null}
        } catch (error) {
            console.log("error at library respository layer:", error);
            return {success: true, data: null, error}
        }
    }
}

export {LibraryRepository};