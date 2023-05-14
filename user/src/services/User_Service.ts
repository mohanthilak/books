import {UserRepository} from "../database";
import {sign, verify, JwtPayload} from 'jsonwebtoken';
import {ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET} from "../config";
import {signUpInterface, userAuthDataInterface, AuthTokens} from "../dto";

class UserService{
    private readonly repository;
    constructor(UR: UserRepository){
        this.repository =  UR;
    }
    
    async SignUp({username, password}:signUpInterface){
        try{
            const data = await this.repository.CreateUser({username, password});
            console.log("User Created: ", data.data)

            if(data.created && data.data){
                const user = data.data;
                const tokens = await this.CreateAuthTokens({username: user.username, _id: user._id})
                return {created: true, _id: user._id, message: "User Created", tokens};
            }

            return {created: false, _id:null, message: 'Username Already Exists', tokens: null}; 
        }catch(e){
            console.log("Error at Customer Service Layer", e);
            return {created: false, _id:null, message: 'Server Error', tokens: null}; 
        }
    }

    async Login(userInputs: signUpInterface){
        try{
            const data = await this.repository.GetPasswordWithUsernameAndID(userInputs)
                if(data.data){
                    const payload = {username: userInputs.username, _id: data.data._id}
                    const {AccessToken, RefreshToken} = await this.CreateAuthTokens(payload);
                    return { err: null, data: {AccessToken, RefreshToken}, message: "Successfully LoggedIn"}; 
                }else return {err: data.err, data:null, message: data.message};
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
            return data;
        }catch(e){
            console.log("Error at service layer", e);
            return {err: true, userfound: false, message: "Error", data: false};
        }
    }


    async DeleteRefreshToken(refreshTokenToBeDeleted:string, uid:string){
        const data = await this.repository.DeleteRefreshToken(refreshTokenToBeDeleted, uid);
        return data;
    }

    
    private async CreateAuthTokens({username, _id}: userAuthDataInterface): Promise<AuthTokens> {
        const AccessToken = sign({username, _id}, ACCESS_TOKEN_SECRET, { expiresIn: "30m" });
        const RefreshToken = sign({username, _id}, REFRESH_TOKEN_SECRET);
        this.repository.AddRefreshToken(RefreshToken, _id);
        return {AccessToken, RefreshToken}
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