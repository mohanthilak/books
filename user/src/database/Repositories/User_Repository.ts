import {UserModel ,User} from "../Models/user";
import {RefreshTokensModel} from "../Models/refreshToken"
import { AddlibraryReturn, AddRefreshTokenReturn, DeleteRefreshTokenReturn, FindRefreshTokenReturn, GetPasswordReturn, GetUserWithEmailReturn, signUpInterface, signUpInterfaceReturn } from "../../dto";

export interface UserRepositoryInterface {
    // CreateUser( inputs: signUpInterface): Promise<signUpInterfaceReturn>
    GetPasswordWithEmailAndID({email, password}: signUpInterface): any
    DeleteRefreshToken(refreshTokenToBeDeleted:string, uid:string): Promise<DeleteRefreshTokenReturn>
    GetUserWithEmail({email, _id}:{email: string, _id: string}): Promise<GetUserWithEmailReturn>
    AddRefreshToken(token:string, uid:string): Promise<AddRefreshTokenReturn>
    FindRefreshToken(token:string, uid:string): Promise<FindRefreshTokenReturn>
    Addlibrary(uid:string, lid:string): Promise<AddlibraryReturn>
}


class UserRepository implements UserRepositoryInterface {
    
    async CreateUser(inputs: signUpInterface){
        try{
            console.log(inputs)
            const user= new UserModel(inputs);
            await user.save();
            
            console.log("user created!", user.email)
            const data = {email: user.email, _id: user._id, name: user.name, profilePicture: user.profilePicture}
            return {success: true, data, error: null};

        }catch(e: any){
            if(e.code == 11000){
                console.log("email Already Exists", e)
                return {success: false, data: null, error: "email Already Exists"};
            }
            console.log("Error while creating user", e)
            return {success: false, data: null, error: e.message};
        }
    }

    async GoogleSignUp({name, googleID, email, profilePicture}: {name: string, googleID: string, email:string, profilePicture: string}){
        try{
            const user = new UserModel({name, googleID, email, profilePicture});
            await user.save();
            return {success: true, data: user, error: null};
        }catch(e){
            console.log("error at user repository layer", e);
            return {success: false, data: null, error: e}
        }
    }

    async GetUserWithGoogleID({googleID}: {googleID: string}){
        try{
            const user = await UserModel.findOne({googleID}).lean();
            return {success: true, data: user?user:null, error: null};
        }catch(e){
            console.log("Error at User Repository layer", e);
            return {success: false, data: null, error: e}
        }
    }

    async GetPasswordWithEmailAndID({email, password}: signUpInterface){
        try{
            const data = await UserModel.findOne({email}).select("password _id");
            if(data){
                const userIsValid = await data.validatePassword(password)
                if(userIsValid)
                    return {success: true, err: null, data };
                else 
                    return {success: false, err: "Email/Password Incorrect", data: null}
            }else{             
                return {success: false, err: "Email not found", data: null};
            }
        }catch(e:any){
            console.log("Error at the repository layer: ", e);
            return {success: false, err: e.message,data: null}
        }
    }
    
    async DeleteRefreshToken(refreshTokenToBeDeleted:string, uid:string):Promise<DeleteRefreshTokenReturn>{
        try{
            const data = await RefreshTokensModel.findOneAndDelete({refreshToken: refreshTokenToBeDeleted, user: uid});
            console.log("refreshToken:", data);
            if(data)
            return {success: true, data: null, error: null};
            else
            return {success: false, data: null, error: "Invalid Refresh Token"};
        }catch(error){
            console.log("Error at User Repository Layer",error);
            return {success: false, data: null, error}
        }
    }

    async GetUserWithEmail({email, _id}:{email: string, _id: string}): Promise<GetUserWithEmailReturn>{
        try{
            let user = await UserModel.findOne({ email, _id }).select("-password").lean();
            if(user)
                return {err: false, userExists: true, data:{email: user.email, _id:user._id, libraries:user.libraries}, message: "Successfully Retrived details"};
            else
                throw {message: 'user does not exits'};
        }catch(e:any){
            console.log("Error at the repository layer: ", e);
            return {err: true, userExists: false, data: null, message: e.message};
        }
    }

    async GetUserWithUserID({uid}:{uid: string}){
        try{
            const user = await UserModel.findById(uid).lean();
            const {password, ...userData} = Object.assign({}, user);
            return {success: user?true:false, data: userData, error: user?null:"Invalid user ID"};
        }catch(e){
            console.log("Error at the repository layer: ", e);
            return {error: e, data: null, success: false};
        }
    }

    async AddRefreshToken(token:string, uid:string):Promise<AddRefreshTokenReturn>{
        try{
            console.log("Adding REfresh Token");
            const refreshToken = new RefreshTokensModel({refreshToken: token, user: uid});
            await refreshToken.save();
            return {error:false}
        }catch(e){
            console.log("Error at the User Repository Layer", e);
            return {error: true}
        }
    }

    async FindRefreshToken(token:string, uid:string): Promise<FindRefreshTokenReturn>{
        try{
            const refreshtoken = await RefreshTokensModel.findOne({refreshToken: token, user: uid});
            if(refreshtoken){
                return {success: true, err: null, data: null, message: "Token Found"};
            }else{
                return {success: false, err: true, data: null, message: "Token Not Found"};
            }
        }catch(e){
            console.log("Error at User Repository Layer", e);
            return {success: false, err: true, data: null, message: "Token not found"}
        }
    }


    async GetALLUsers() {
        try{
            const users = await UserModel.find({});
            return {success: true, data: users, error: null};
        }catch(e){
            console.log("Error at the User Repository layer", e);
            return {success: false, data: null, error: e}
        }
    }

    async Addlibrary(uid:string, lid:string): Promise<AddlibraryReturn>{
        try{
            const user = await UserModel.findById(uid);
            if(user){
                user.libraries.push(lid);
                user.save()
            }
            return {err: false, message: "Successful"}
        }catch(e){
            console.log("Error at User Repository layer", e);
            return {err: true, message: "server error"};
        }
    }

    async UpdateUserLocation({latitude, longitude, uid}: {latitude: number, longitude: number, uid: string}){
        try{
            const user = await UserModel.findById(uid);
            if(user){
                const loc: {type:string, coordinates: [number, number]} = {type: "Point", coordinates: [latitude, longitude]};
                user.currentLocation = loc;
                user.save();
                const newUser = user.toObject()
                const {password, ...userDataWithoutPassword} = newUser;
                return {success: true, data: userDataWithoutPassword, error: null}; 
            }
            return {success: false, data: null, error: "Invalid userID"}
        }catch(e){
            console.log("Error while Updating User Location at User-Repository layer:", e);
            return {success: false, data: null, error: e}
        }
    }

    // async UpdateLocation(inputs: updateLocationInterface){
    //     try{

    //         const user = inputs.user;
    //         const data = await UserModel.findOne({username: user.username, _id: user._id})
    //         if(data){
    //             console.log("HAHAHAHa")
    //             const latitude = parseFloat(inputs.latitude);
    //             const longitude = parseFloat(inputs.longitude)
    //             const coordinates: [number,number] = [longitude, latitude];
    //             const location = {
    //                 type: "Point",
    //                 coordinates,
    //             }
    //             data.location = location;
    //             const result  = await data.save();
    //             console.log(result);
    //         }
    //     }catch(e){
    //         console.log("Error at repository layer",e);
    //         return e;
    //     }
    // }

    // async GetPoints(inputs: Partial<updateLocationInterface>){
    //     try{
    //         const {longitude, latitude} = inputs;
    //         if(longitude && latitude){
    //             // await UserModel.createIndexes({"address.location": "2d"});
    //             const data = await UserModel.aggregate([
    //                 {
    //                     $geoNear:{
    //                         near: {type:"Point", coordinates:[parseFloat(longitude), parseFloat(latitude)]},
    //                         key: "location",
    //                         maxDistance: 1000*1000,
    //                         distanceMultiplier: 1 / 1000,
    //                         distanceField: "dist.calculated",
    //                         spherical: true
    //                     }
    //                 }
    //             ])
    //             console.log("DATA FROM MONGO", data);
    //             return data
    //         }
    //     }catch(e){
    //         console.log("Error at Repository layer", e);
    //         return e
    //     }
    // } 
}   

export {UserRepository}