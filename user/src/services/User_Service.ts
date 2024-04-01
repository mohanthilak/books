import {UserRepository} from "../database";
import {sign, verify, JwtPayload } from 'jsonwebtoken';
import {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} from "../config";
import {signUpInterface, userAuthDataInterface, AuthTokens} from "../dto";
import decode from "jwt-decode"


class UserService{
    private readonly repository;
    constructor(UR: UserRepository){
        this.repository =  UR;
    }
    
    async SignUp({email, password}:signUpInterface){
        try{
            const data = await this.repository.CreateUser({email, password});
            console.log("User Created: ", data.data)

            if(data.success && data.data){
                const user = data.data;
                let {_id} = user;
                const id = _id as unknown as string; 
                const {accessToken, refreshToken} = await this.CreateAuthTokens({email: user.email, _id: id})
                return {success: true, data: {uid: user._id,accessToken, refreshToken, verificationStatus:user.verificationStatus, name: user.name, profilePicture: user.profilePicture},  message: "User Created"};
            }

            return {success: false, data: null, message: 'Username Already Exists'}; 
        }catch(e){
            console.log("Error at Customer Service Layer", e);
            return {success: false, data: null, message: 'Server Error'}; 
        }
    }

    async Login(userInputs: signUpInterface){
        try{
            const data = await this.repository.GetPasswordWithEmailAndID(userInputs)
            if(data.data){
                const payload = {email: userInputs.email, _id: data.data._id as unknown as string}
                const {accessToken, refreshToken} = this.CreateAuthTokens(payload);
                return {success: true, err: null, data: {accessToken, refreshToken, uid: data.data._id}}; 
            }else return {success: false, err: data.err, data:null};
        }catch(e){
            console.log("Error at the service layer: ", e);
            return {success: false, err: e, data:null}
        }
    }
    
    async GetAllUsers(){
        try{
            return this.repository.GetALLUsers();
        }catch(e){
            console.log("Error at user service layer", e);
            return {success: false, data: null, error: e};
        }
    }
    
    
    async RefreshAccessTokenWithUserDetails(refreshToken:string, uid:string){
        try {
            const tokensData = await this.GenerateAccessToken(refreshToken, uid);
            if(tokensData.success){
                const userData = await this.GetUserWithID({uid});
                if(userData.success){
                    return {success: true, data: {...tokensData.data, name:userData.data?.name, profilePicture:userData.data?.profilePicture, currentLocation:{latitude: userData.data?.currentLocation?.coordinates[0], longitude: userData.data?.currentLocation?.coordinates[1]} }}
                }
                return userData;
            } 
            return tokensData;
        } catch (e) {
            console.log("Error at user service layer", e);
            return {success: false, data: null, error: e};
        }
       
    }
    
    async GenerateAccessToken(refreshToken:string, uid:string){
        try{
            const data = await this.repository.FindRefreshToken(refreshToken, uid);
            if(data.err){
                return data;
            }else{
                const user = <JwtPayload>verify(refreshToken, REFRESH_TOKEN_SECRET);
                const accesstoken = sign({email: user.email, _id:user._id}, ACCESS_TOKEN_SECRET, {expiresIn: '30m'});
                return {success: true, err: null, data:{accesstoken, refreshToken, uid}, message:"AccessToken Successfully created"};
            }
        }catch(e){
            console.log("Error at User Service Layer", e);
            return {success: false, err: e, data:null, message: "Invalid Refresh Token"};
        }
    }
    
    
    async GetUser({email, _id}:userAuthDataInterface){
        try{
            return await this.repository.GetUserWithEmail({email, _id});
        }catch(e){
            console.log("Error at service layer", e);
            return {success: false, data: false, error: e};
        }
    }
    
    
    async DeleteRefreshToken(refreshTokenToBeDeleted:string, uid:string){
        const data = await this.repository.DeleteRefreshToken(refreshTokenToBeDeleted, uid);
        return data;
    }
    
    
    private CreateAuthTokens({email, _id}: {email: string,_id: string}): {accessToken: string,refreshToken: string} {
        const accessToken = sign({email, _id}, ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
        const refreshToken = sign({email, _id}, REFRESH_TOKEN_SECRET, {expiresIn: "1d"});
        this.repository.AddRefreshToken(refreshToken, _id);
        return {accessToken, refreshToken}
    }
    
    async GoogleSignAuthentication({token}:{token:string}){
        try{
            const decodedToken = this.DecodeToken({token});
            if(decodedToken.success) {
                const {given_name, family_name, sub, email, picture} = decodedToken.data;
                const name = given_name + ' ' + family_name;
                const userExists = await this.GetUserWithGoogleID({googleID: sub});
            
                if(userExists.success){
                    if(userExists.data){
                        const {accessToken, refreshToken} = await this.CreateAuthTokens({email, _id: userExists.data._id as unknown as string});
                        return {success: true,data: {uid: userExists.data._id, verificationStatus: userExists.data.verificationStatus, accessToken, refreshToken, name, profilePicture: picture}, error: null}
                    }
                    const data = await this.repository.GoogleSignUp({name, googleID: sub, email, profilePicture: picture});
                    if(data.success){
                        const {accessToken, refreshToken} = await this.CreateAuthTokens({email, _id: data.data?._id as unknown as string});
                        // console.log("\n\n\n!@!@!@!@!",{uid: data.data?._id, accessToken, refreshToken, ...data.data})
                        return {success: true, data: {uid: data.data?._id, accessToken, refreshToken, name,verificationStatus: data.data?.verificationStatus, profilePicture: picture}, error: null}
                    }
                    return data;
                }
                
                return userExists;

            }
            return decodedToken;
        }catch(e){
            console.log("Error at user service level", e);
            return {success: false, data:null, error: e};
        }
    }


    private DecodeToken({token}: {token:string}){
        try{
            const data = decode(token) as any;
            return {success: true, data, error: null}
        }catch(e) {
            console.log("Error at user service layer", e);
            return {success: false, data: null, error: e};
        }
    }

    async GetUserWithID({uid}:{uid:string}){
        return this.repository.GetUserWithUserID({uid});
    }

    async GetUserWithGoogleID({googleID}: {googleID:string}) {
        return this.repository.GetUserWithGoogleID({googleID})
    }

    async UpdateUserLocation({latitude, longitude, uid}: {latitude:number, longitude: number, uid: string}){
        return this.repository.UpdateUserLocation({latitude, longitude, uid});
    }


    async UpdateUserName({firstName, lastName, uid}: {firstName: string, lastName: string, uid: string}){
        if (firstName == "") return {success: false, data: null, error: "empty string"}
        const name = firstName.concat(' ', lastName);
        return this.repository.UpdateUserName({name, uid})
    }

    async UpdateUserPhoneNumber({phoneNumber, uid}:{phoneNumber:number, uid: string}){
        let regex = /^[1-9][0-9]{9}$/
        let isPhoneNumberOf10digits =regex.test(phoneNumber.toString()) 
        if(!isPhoneNumberOf10digits) return {success: false, data: null, error: "invalid phone number"};
        return this.repository.UpdatePhoneNumber({phoneNumber, uid})
    }

    async VerifyPhoneNumber({otp, phoneNumber,uid}: {otp: number, phoneNumber: number, uid: string}){
        if (otp != 123456) return {success: false, data: null, error: "invalid OTP"} 
        return this.repository.VerifyPhoneNumber({otp, phoneNumber, uid});
    }

    async FindUsersWithIDs({ids}: {ids: string[]}){
        return this.repository.FindUsersWithIDs({ids});
    }
    // async UpdateLocation(inputs: updateLocationInterface){
    //     const data = await this.repository.UpdateLocation(inputs)
    //     return data;
    // }
    
    // async GetPoints(inputs: Partial<updateLocationInterface>){
    //     const data = await this.repository.GetPoints(inputs);
    //     return data;
    // }
}

export {UserService};