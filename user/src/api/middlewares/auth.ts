import {Request, Response, NextFunction} from "express"
import {verify} from 'jsonwebtoken'
import {ACCESS_TOKEN_SECRET} from "../../config";



export const auth =  (req:Request, res: Response, next: NextFunction)=>{
    const authHeader = req.get('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    console.log("at auth middleware", token);
    
    if(token == null) return res.send({status: 404, message: "User Not Found"})
    
    verify(token, ACCESS_TOKEN_SECRET, (err: any, payload: any)=>{
        if(err) return res.json({status: 403, message: err});
        req.user = payload;
        return next();
    })
}
