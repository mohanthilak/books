import {UserRepository} from "../database";
import {sign, verify, JwtPayload} from 'jsonwebtoken';
import {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} from "../config";
import {signUpInterface, userAuthDataInterface, userType, updateLocationInterface} from "../dto";

class UserService{
    repository;
    constructor(){
        this.repository = new UserRepository();
    }

    async SignUp(userInputs:signUpInterface){
        try{
        let {username, password} = userInputs;
        const data = await this.repository.CreateUser({username, password});
        console.log("User Created: ", data.user)

        if(data.created && data.user){
            const user =<userType>data.user;
            const token = await sign({username, _id: user._id}, ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
            const refreshToken = await sign({username, _id:user._id}, REFRESH_TOKEN_SECRET);
            this.repository.AddRefreshToken(refreshToken, user._id);
            return {created: true, _id: user._id, token, refreshToken};
        }
        return {created: false, message: 'Username Already Exists'}; 
        }catch(e){
            console.log("Error at Customer Service Layer", e);
            return {created: false, message: 'Server Error'}; 
        }
    }

    async Login(userInputs: signUpInterface){
        try{
            const data = await this.repository.GetPassword(userInputs)
            if(data){
                if(data.err)
                    return {err: data.err, data: null, message: data.message};
                else{
                    if(data.data){
                        const payload = {username: userInputs.username, _id: data.data._id}
                        const accesstoken = await sign(payload, ACCESS_TOKEN_SECRET, { expiresIn: '30m' });
                        const refreshToken = await sign(payload, REFRESH_TOKEN_SECRET);
                        this.repository.AddRefreshToken(refreshToken, data.data._id); 
                        return { err: null, data: {accesstoken, refreshToken}, message: "Successfully LoggedIn"}; 
                    }
                }
            }
        }catch(e){
            console.log("Error at the service layer: ", e);
            return {err: e, data:null, message: "Server Error"}
        }
    }


    async GenerateAccessToken(refreshToken:string, uid:string){
        try{
            const data = await this.repository.FindRefreshToken(refreshToken, uid);
            if(data.err){
                return data;
            }else{
                const user = <JwtPayload>verify(refreshToken, REFRESH_TOKEN_SECRET);
                const accesstoken = sign({username: user.username, _id:user._id}, ACCESS_TOKEN_SECRET, {expiresIn: '30m'});
                return {err: null, data:{accesstoken, refreshToken}, message:"AccessToken Successfully created"};
            }
        }catch(e){
            console.log("Error at User Service Layer", e);
            return {err: e, data:null, message: "Invalid Refresh Token"};
        }
    }



    async GetUser({username, _id}:userAuthDataInterface){
        try{
            const data = await this.repository.GetUserWithUsername({username, _id});
            console.log(data);
            return data;
        }catch(e){
            console.log("Error at service layer", e);
            return {err: true, UserFound: false, message: "Error", user: false};
        }
    }


    async DeleteRefreshToken(refreshTokenToBeDeleted:string, uid:string){
        const data = await this.repository.DeleteRefreshToken(refreshTokenToBeDeleted, uid);
        return data;
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