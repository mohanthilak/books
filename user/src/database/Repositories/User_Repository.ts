import {UserModel ,User} from "../Models/user";
import {RefreshTokensModel} from "../Models/refreshToken"
import { AddlibraryReturn, AddRefreshTokenReturn, DeleteRefreshTokenReturn, FindRefreshTokenReturn, GetPasswordReturn, GetUserWithEmailReturn, signUpInterface, signUpInterfaceReturn } from "../../dto";
import mongoose from "mongoose";

export interface UserRepositoryInterface {
    // CreateUser( inputs: signUpInterface): Promise<signUpInterfaceReturn>
    GetPasswordWithEmailAndID({email, password}: signUpInterface): any
    DeleteRefreshToken(refreshTokenToBeDeleted:string, uid:string): Promise<DeleteRefreshTokenReturn>
    // GetUserWithEmail({email, _id}:{email: string, _id: string}): Promise<GetUserWithEmailReturn>
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
            const data = {email: user.email, _id: user._id, name: user.name, profilePicture: user.profilePicture, verificationStatus: user.verificationStatus}
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
            let index = user.verificationStatus.indexOf('name-entry')
            user.verificationStatus.splice(index, 1);
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

    async GetUserWithEmail({email, _id}:{email: string, _id: string}){
        try{
            let user = await UserModel.findOne({ email, _id }).select("-password").lean();
            return {success: user ? true : false, data: user, error: user ? null: "user-not-found"}
        }catch(e){
            console.log("Error at the repository layer: ", e);
            return {success: false, data: null, error:e};
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
            const refreshToken = new RefreshTokensModel({refreshToken: token, user: uid, expiresAt: new Date()});
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
                await user.save()
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
                await user.save();
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

    async UpdateUserName({name, uid}:{name:string, uid: string}){
        try {
            const result = await UserModel.findById(uid);
            if(result){
                result.name = name;
                let index = result.verificationStatus.indexOf('name-entry');
                if(index !== -1) result.verificationStatus.splice(index, 1)
                console.log(result);
                await result.save();
                return {success: true, data:result, error: null}
            }
            return {success: false, data: null, error: "user not found"}
        } catch (e) {
            console.log("Error while Updatating user's name at repository layer", e);
            return {success: true, data: null, error: e}
        }
    }
    
    async UpdatePhoneNumber({phoneNumber, uid}:{phoneNumber:number, uid: string}){
        try {
            const result = await UserModel.findById(uid);
            if(result){
                result.phoneNumber = phoneNumber;
                await result.save();
                return {success: true, data:result, error: null}
            }
            return {success: false, data: null, error: "user not found"}
        } catch (e) {
            console.log("Error while Updatating user's phone Number at repository layer", e);
            return {success: true, data: null, error: e}
        }
    }

    async SetPhoneVerification({uid}: {uid: string}) {
        try {
            const user = await UserModel.findById(uid);
            if (user){
                let index = user.verificationStatus.indexOf('phone-verification')
                user.verificationStatus.splice(index, 1);
                await user.save();
                return {success: true, data: user, error: null}    
            }
            return {success: false, data: null, error: 'user not found'}
        } catch (e) {
            console.log("Error while setting user's phone verification status at repository layer", e);
            return {success: true, data: null, error: e}
        }
    }
    
    async SetEmailVerification({uid}: {uid: string}) {
        try {
            const user = await UserModel.findById(uid);
            if (user){
                let index = user.verificationStatus.indexOf('email-verification')
                user.verificationStatus.splice(index, 1);
                await user.save();
                return {success: true, data: user, error: null}    
            }
            return {success: false, data: null, error: 'user not found'}
        } catch (e) {
            console.log("Error while setting user's email verification status at repository layer", e);
            return {success: true, data: null, error: e}
        }
    }

    async VerifyPhoneNumber({otp, phoneNumber, uid}: {otp:number, phoneNumber: number, uid: string}){
        try {
            const user = await UserModel.findById(uid);

            if (user){
                console.log(typeof user.phoneNumber, typeof phoneNumber)
                if(user.phoneNumber !== phoneNumber) return {success: false, data: null, error: "invalid-phoneNumber"}
                let index = user.verificationStatus.indexOf('phone-verification');
                if (index != -1) user.verificationStatus.splice(index, 1);
                user.save()
                return {success: true, data: user, error: null};
            }
            return {success: false, data: null, error: "invalid user-id"}
        } catch (e) {
            console.log("Error while verifying user's phone number with otp at repository layer", e);
            return {success: true, data: null, error: e}
        }
    }
    
    async FindUsersWithIDs({ids}: {ids: string[]}){
        try {
            const objectIDs = ids.map(el=>{
                return new mongoose.Types.ObjectId(el)
            })
            const users = await UserModel.find({_id: {$in: [...ids]}}).select('-password')
            console.log("users", users)
            return {success: true, data: users, error: null};
        } catch (e) {
            console.log("error while get users from user id array:", e);
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