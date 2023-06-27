import {Application, Request, Response} from "express";
import {UserService} from "../../services";
import {auth} from "../middlewares";
import { signUpInterface} from "../../dto"
import { CreateUserInput, createUserSchema,  GetUserDetailsInput} from "../../Schema/User.schema";
import validateResources from "../middlewares/validateRequest";
import { Channel } from "amqplib";
import {SubscribeMessage, PublishMessage} from "../../utils"
import { COMMON_BINDING_KEY, COMMON_EXCHANGE } from "../../config";

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

export const UserAPI = (app: Application, channel: Channel, service: UserService)=>{
    SubscribeMessage(channel)

    app.get("/trial", (req:Request, res: Response)=>{
        console.log("Request Reached");
        // res.json({message: "Request Reached"});
        res.send("all good")
        // PublishMessage(channel, NOTIFICATION_BINDING_KEY, JSON.stringify({fromService: "UserService", typeOfNotification:"SMS", body: {userId: "DAFADF", TimeIssued:new Date(), operation:"send_otp"}}), NOTIFICATION_EXCHANGE)
    })

    app.post("/signup", validateResources(createUserSchema) ,async (req: Request<{}, {}, CreateUserInput>, res: Response)=>{
        try{
            const {username, password} = req.body;
            const data = await service.SignUp({username, password});
            if(data.created)
                return res.status(200).json(data);
            res.status(422).json({data});
        }catch(e){
            console.log("Error at api layer", e);
            return res.status(422).json({message: "Username already exists"})
        }
    })
    
    
    app.post("/login", validateResources(createUserSchema), async(req:Request<{}, {}, CreateUserInput>, res: Response)=>{
        try{
            const {username, password}: signUpInterface = req.body;
            const data = await service.Login({username, password});
            
            if(data.data) return res.status(200).json({message: "Logged In Successfully", accessToken: data.data.AccessToken, refreshToken: data.data.RefreshToken});

                let statusCode = 200;    
                if(data.err){
                    switch(data.message){
                        case "Server Error": statusCode=503;
                        break;
                        case "username not found": statusCode=404;
                        console.log("Username not found at api layer")
                        break;
                        case "Username/Password Incorrect":
                            statusCode = 401;
                            break;
                    }
                    return res.status(statusCode).json({status: statusCode,message: data.message})
            }
        }catch(e){
            console.log("Error at the API Layer: ", e);
            return res.json({status: 503, request: false, message: "Server Error"})
        }
    })

    app.post("/logout/:uid", async(req: Request, res: Response) =>{
        const refreshTokenToBeDeleted: string = req.body.refreshToken;
        const accessToken: string = req.body.accessToken;
        const {uid} = req.params;
        const data = await service.DeleteRefreshToken(refreshTokenToBeDeleted, uid);

        if(!data.error){
            PublishMessage(channel, COMMON_BINDING_KEY, JSON.stringify({operation: "debar_user", data: {uid, accessToken}}), COMMON_EXCHANGE);
            res.status(200).json({message: "Refresh Token Deleted"});
        }else{
            res.status(403).json(data);
        }
        
    })
    

    app.post("/renewtoken", async(req:Request, res:Response)=>{
        const {refreshToken, uid}: {refreshToken:string, uid: string} = req.body;
        const data = await service.GenerateAccessToken(refreshToken, uid);
        if(data.data){
            res.status(200).json({accessToken: data.data.accesstoken, refreshToken: data.data.refreshToken});
        }else{
            res.status(404).json({message: data.message});
        }
    })
    
    app.get("/", auth, async (req:Request<{}, {}, GetUserDetailsInput>, res: Response)=>{
        try{
            if(req.user){
                const data = await service.GetUser(req.user)
                if(data.err)
                    return res.json({status: 501, data })
                else if(data.data)
                    return res.json({status: 200, data: data.data})
            }else{
                return res.sendStatus(404).send({message: "User Not Found"})
            }
        }catch(e){
            console.log("Error at API Layer", e);
            return res.json({requestSuccefull: false, message: "Server Error"})
        }
    })
}



// router.post("/sendloc", auth, async (req: Request, res: Response)=>{
//     try{
//         if(req.user){
//             const {latitude, longitude}:Partial<updateLocationInterface> = req.body;
//             if(latitude && longitude){
//                 const data = await service.UpdateLocation({user: req.user, latitude, longitude})
//             }
//         }
//     }catch(e){
//         res.status(500).send({err: e, message: "Server Error"})
//     }
// })

// router.post("/getpoints", auth, async (req: Request, res: Response)=>{
//     try{
//         if(req.user){
//             const {latitude, longitude}:Partial<updateLocationInterface> = req.body;
//             if(latitude && longitude){
//                 const data = await service.GetPoints({latitude, longitude});
//             }

//         }
//     }catch(e){
//         console.log("Error at api layer", e)
//     }
// })
  