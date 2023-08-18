import {Request, Response, NextFunction} from "express"
import {verify} from 'jsonwebtoken'
import {redisClient} from "../../index"
import {ACCESS_TOKEN_SECRET} from "../../config";

interface user{
    username: string,
    _id: string
}
declare global {
namespace Express {
  interface Request {
    user?: user 
  }
}
}

export const auth =  (req:Request, res: Response, next: NextFunction)=>{
    const authHeader = req.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    console.log("at auth middleware", ACCESS_TOKEN_SECRET);
    
    if(token == null) return res.send({status: 404, message: "User Not Found"})
    
    verify(token, ACCESS_TOKEN_SECRET, async (err: any, payload: any)=>{
        if(err) return res.json({status: 403, message: err});
        const checkUserStatus = await checkIfTokenIsBarred(token, payload._id);
        console.log("Is User Token Barred? ", checkUserStatus);
        
        if (!checkUserStatus) {
            req.user = <user>payload;
            return next();
        } 
        return res.status(401).json({message: "Token Unauthorized"});
    })
}


const checkIfTokenIsBarred = async (token: string, uid:string) =>{
    try{
        const tokenValue = await redisClient.get(uid)
        if(tokenValue){
            if(token === tokenValue)
                return true;
        } 
        return false;
    }catch(error){
        console.log("Error at Auth Middleware from redis: ", error);
        return true;
    }

}