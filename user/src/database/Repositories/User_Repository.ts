import {UserModel ,User} from "../Models/user";
import {RefreshTokensModel} from "../Models/refreshToken"
import { AddlibraryReturn, AddRefreshTokenReturn, DeleteRefreshTokenReturn, FindRefreshTokenReturn, GetPasswordReturn, GetUserWithUsernameReturn, signUpInterface, signUpInterfaceReturn } from "../../dto";

export interface UserRepositoryInterface {
    CreateUser( inputs: signUpInterface): Promise<signUpInterfaceReturn>
    GetPasswordWithUsernameAndID({username, password}: signUpInterface): Promise<GetPasswordReturn>
    DeleteRefreshToken(refreshTokenToBeDeleted:string, uid:string): Promise<DeleteRefreshTokenReturn>
    GetUserWithUsername({username, _id}:{username: string, _id: string}): Promise<GetUserWithUsernameReturn>
    AddRefreshToken(token:string, uid:string): Promise<AddRefreshTokenReturn>
    FindRefreshToken(token:string, uid:string): Promise<FindRefreshTokenReturn>
    Addlibrary(uid:string, lid:string): Promise<AddlibraryReturn>
}


class UserRepository implements UserRepositoryInterface {
    
    async CreateUser(inputs: signUpInterface): Promise<signUpInterfaceReturn>{
        try{
            const user= new UserModel(inputs);
            await user.save();
            
            console.log("user create!", user.username)
            const data = {username: user.username, _id: user._id}
            return {created: true, data, message: "Successfully Created"};

        }catch(e: any){
            if(e.code == 11000){
                console.log("Username Already Exists")
                return {created: false, data: null, message: "Username Already Exists"};
            }
            console.log("Error while creating user", e)
            return {created: false, data: null, message: e.message};
        }
    }

    async GetPasswordWithUsernameAndID({username, password}: signUpInterface): Promise<GetPasswordReturn>{
        try{
            const data = await UserModel.findOne({username}).select("password _id");
            if(data){
                const userIsValid = await data.validatePassword(password)
                if(userIsValid)
                    return {err: false, data, message: "Authenticated" };
                else 
                    return {err: true, data: null, message: "Username/Password Incorrect"}
            }else{             
                return {err: true, data: null, message: "username not found"};
            }
        }catch(e:any){
            console.log("Error at the repository layer: ", e);
            return {err: true,data: null, message: e.message}
        }
    }
    
    async DeleteRefreshToken(refreshTokenToBeDeleted:string, uid:string):Promise<DeleteRefreshTokenReturn>{
        try{
            const data = await RefreshTokensModel.findOneAndDelete({refreshToken: refreshTokenToBeDeleted, user: uid});
            console.log("refreshToken:", data);
            if(data)
            return {error: null};
            else
            return {error: "Invalid Refresh Token"};
        }catch(error){
            console.log("Error at User Repository Layer",error);
            return {error}
        }
    }

    async GetUserWithUsername({username, _id}:{username: string, _id: string}): Promise<GetUserWithUsernameReturn>{
        try{
            let user = await UserModel.findOne({ username, _id }).select("-password").lean();
            if(user)
                return {err: false, userExists: true, data:{username: user.username, _id:user._id, libraries:user.libraries, roles: user.roles}, message: "Successfully Retrived details"};
            else
                throw {message: 'user does not exits'};
        }catch(e:any){
            console.log("Error at the repository layer: ", e);
            return {err: true, userExists: false, data: null, message: e.message};
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
            console.log(refreshtoken)
            if(refreshtoken){
                return {err: null, data: null, message: "Token Found"};
            }else{
                return {err: true, data: null, message: "Token Not Found"};
            }
        }catch(e){
            console.log("Error at User Repository Layer", e);
            return {err: true, data: null, message: "Token not found"}
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