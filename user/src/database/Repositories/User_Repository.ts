import {UserModel, User} from "../Models/user";
import {RefreshTokensModel} from "../Models/refreshToken"
import {updateLocationInterface} from "../../dto"
class UserRepository {
    
    async CreateUser(inputs: Partial<User>){
        try{
            const user= new UserModel(inputs);
            await user.save();
            
            console.log("user create!", user.username)
            
            return {created: true, user, message: "Successfully Created"};

        }catch(e: any){
            if(e.code == 11000){
                console.log("Username Already Exists")
                return {created: false, user: false, message: "Username Already Exists"};
            }
            console.log("Error while creating user", e)
            return {created: false, user: false, message: "Server Error"};
        }
    }

    async GetPassword({username, password}: Partial<User>){
        try{
            const data = await UserModel.findOne({username}).select("password _id");
            if(data){
                if(password){
                    const userIsValid = await data.validatePassword(password)
                    if(userIsValid)
                        return {err: false, data, message: "Authenticated" };
                    else 
                        return {err: true, data: null, message: "Username/Password Incorrect"}
                }
            }else{             
                return {err: true, data: null, message: "username not found"};
            }
        }catch(e){
            console.log("Error at the repository layer: ", e);
            return {err: e,data: null, message: "Server Error"}
        }
    }
    
    async DeleteRefreshToken(refreshTokenToBeDeleted:string, uid:string){
        try{
            const data = await RefreshTokensModel.findOneAndDelete({refreshToken: refreshTokenToBeDeleted, user: uid});
            console.log(data);
            if(data)
            return {error: null};
            else
            return {error: "Server Error"};
        }catch(error){
            console.log("Error at User Repository Layer",error);
            return {error}
        }
    }

    async GetUserWithUsername({username, _id}:{username: string, _id: string}){
        try{
            let user = await UserModel.findOne({ username, _id }).select("-password").lean();
            console.log(username,_id,user);
            if(user)
            console.log(user.username)
            if(user)
                return {err: false, user};
            else
                throw 'user does not exits';
        }catch(e){
            console.log("Error at the repository layer: ", e);
            return {err: true, userExists: false, user: false};
        }
    }

    async AddRefreshToken(token:string, uid:string){
        try{
            console.log("Adding REfresh Token");
            const refreshToken = new RefreshTokensModel({refreshToken: token, user: uid});
            await refreshToken.save();
        }catch(e){
            console.log("Error at the User Repository Layer", e);
        }
    }

    async FindRefreshToken(token:string, uid:string){
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
            return {err: e, data: null, message: "Token not found"}
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




    async Addlibrary(uid:string, lid:string){
        try{
            const user = await UserModel.findById(uid);
            if(user){
                user.libraries.push(lid);
                user.save()
            }
            return {err: null, data:user, message: "Successful"}
        }catch(e){
            console.log("Error at User Repository layer", e);
            return {err: e, data: null, message: "server error"};
        }
    }


}   

export {UserRepository}