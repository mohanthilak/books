import {Application, Request, Response} from "express";
import {UserService} from "../../services";
import {auth} from "../middlewares";
import { signUpInterface} from "../../dto"
import { CreateUserInput, createUserSchema,  GetUserDetailsInput} from "../../Schema/User.schema";
import validateResources from "../middlewares/validateRequest";
import { Channel } from "amqplib";
import {SubscribeMessage, PublishMessage} from "../../utils"
import { COMMON_BINDING_KEY, COMMON_EXCHANGE, LIBRARY_BINDING_KEY, LIBRARY_EXCHANGE, NOTIFICATION_BINDING_KEY, NOTIFICATION_EXCHANGE } from "../../config";


interface user{
        email: string,
        _id: string
    }
declare global {
    namespace Express {
      interface Request {
        user?: user 
      }
    }
  }


  const setCookie = ( res: Response, data: any) =>{
    console.log(data.data.refreshToken, "!!!!!!")
    res.cookie("rt", data.data.refreshToken, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    });
    res.cookie("uid", data.data.uid, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        maxAge: 24 * 60 * 60 * 1000,
    });
  }
export const UserAPI = (app: Application, channel: Channel, service: UserService)=>{
    // SubscribeMessage(channel)
    let i =0;
    app.get("/trial", async (req:Request, res: Response)=>{
        console.log(++i)
        let data = await service.GetAllUsers();
        channel.publish(NOTIFICATION_EXCHANGE, NOTIFICATION_BINDING_KEY, Buffer.from(JSON.stringify({operation:"Trial", fromService: "user-service", data: {date: Date.now()}})))
        if(data?.success) {
            return res.json({...data, statusCode: 200}); 
        }else{
            return res.json({...data, statusCode: 500});
        }
        // PublishMessage(channel, NOTIFICATION_BINDING_KEY, JSON.stringify({fromService: "UserService", typeOfNotification:"SMS", body: {userId: "DAFADF", TimeIssued:new Date(), operation:"send_otp"}}), NOTIFICATION_EXCHANGE)
    })

    app.post("/user/signup" ,async (req: Request, res: Response)=>{
        try{
            if(req.headers.logintype == "google"){
                const {token}:{token:string} = req.body;
                const data = await service.GoogleSignAuthentication({token});
                console.log("data.data", data.data)
                res.cookie("rt", data.data.refreshToken, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000,
                });
                res.cookie("uid", data.data.uid, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000,
                });
                console.log("response:", data)
                return res.status(200).json(data)
            }
            const {email, password} = req.body;
            const data = await service.SignUp({email, password});
            if(data.success){
                res.cookie("rt", data.data?.refreshToken, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000,
                });
                res.cookie("uid", data.data?.uid, {
                    httpOnly: true,
                    sameSite: "none",
                    secure: true,
                    maxAge: 24 * 60 * 60 * 1000,
                });
                console.log("response:", data)
                return res.status(200).json(data);
            }
            res.status(200).json({data});
        }catch(e){
            console.log("Error at api layer", e);
            return res.status(200).json({message: "Email already exists"})
        }
    })
    
    
    app.post("/user/signin", validateResources(createUserSchema), async(req:Request, res: Response)=>{
        try{
            if(req.headers.logintype == "google"){
                const {token}:{token:string} = req.body;
                const data = await service.GoogleSignAuthentication({token});
                setCookie(res, data);
                return res.status(200).json(data)
            }
            const {email, password}: signUpInterface = req.body;
            const data = await service.Login({email, password});
            
            if(data.success && data.data){
                setCookie(res, data)
                // console.log("response:", {success: true, data:{uid: data.data.uid, accessToken: data.data.accessToken, refreshToken: data.data.refreshToken}, error: null}, "also available:", data)
                return res.status(200).json({success: true, data:{uid: data.data.uid, accessToken: data.data.accessToken, refreshToken: data.data.refreshToken}, error: null});
            } 

            let statusCode = 200;    
            if(data.err){
                // console.log("response:", data)
                return res.status(statusCode).json({data})
            }
        }catch(e){
            console.log("Error at the API Layer: ", e);
            return res.json({status: 503, request: false, message: "Server Error"})
        }
    })

    app.post("/user/logout",auth, async(req: Request, res: Response) =>{
        const cookies = req.cookies;
        if (!cookies?.rt) return res.sendStatus(403);
        const {rt, uid} = cookies;
        const {accessToken} = req.body; 
        const data = await service.DeleteRefreshToken(rt, uid);
        if(!data.error){
            PublishMessage(channel, COMMON_BINDING_KEY, JSON.stringify({operation: "debar_user", data: {uid, accessToken}}), COMMON_EXCHANGE);
            res.clearCookie("rt")
            res.clearCookie("uid")
            res.status(200).json({success:true, message: "Refresh Token Deleted"});
        }else{
            res.status(403).json(data);
        }
        
    })
    

    app.post("/user/renewtoken", async(req:Request, res:Response)=>{
        const {refreshToken, uid}: {refreshToken:string, uid: string} = req.body;
        const data = await service.GenerateAccessToken(refreshToken, uid);
        if(data.data){
            res.status(200).json({accessToken: data.data.accesstoken, refreshToken: data.data.refreshToken});
        }else{
            res.status(404).json({message: data.message});
        }
    })
    
    app.get("/user/", auth, async (req:Request<{}, {}, GetUserDetailsInput>, res: Response)=>{
        try{
            if(req.user){
                const data = await service.GetUser(req.user)
                return res.status(data.success?200:500).json(data)
            }else{
                return res.sendStatus(404).send({message: "User Not Found"})
            }
        }catch(e){
            console.log("Error at API Layer", e);
            return res.json({requestSuccefull: false, message: "Server Error"})
        }
    })

    // /Sends a new access token after validating the refresh token
    app.post("/user/refresh", async (req, res) => {
    try {
        const cookies = req.cookies;
        if (!cookies?.rt) return res.sendStatus(403);
        const {rt, uid} = cookies;
        const data = await service.RefreshAccessTokenWithUserDetails(rt, uid);
        console.log("/refresh response:", data)
        return res.status(200).json(data);
    } catch (e) {
        console.log("Error while handling refresh access token handler", e);
        return res.status(202).json({ message: "error", e });
    }
    });

    app.post("/user/update-loc", auth, async(req, res) =>{
        try{
            const {latitude, longitude}:{latitude: number, longitude: number} = req.body;
            const data = await service.UpdateUserLocation({latitude, longitude, uid: req.user?._id as string});
            return res.status(200).json(data); 
        }catch(e){
            console.log("Error while handling update-location handler", e);
            return res.status(202).json({success: false, data: null, error: e});
        }
    })

    app.post("/user/update-name",auth, async(req, res) => {
        try {
            const {firstName, lastName} = req.body;
            const data = await service.UpdateUserName({firstName, lastName, uid: req.user?._id as string});
            if (data.success) return res.status(200).json(data)
            return res.status(401).json(data);
        } catch (e) {
            console.log("Error while handling update-location handler", e);
            return res.status(202).json({success: false, data: null, error: e});

        }
    })

    app.post("/user/update-phoneNumber", auth, async(req, res)=>{
        try {
           const {phoneNumber}:{phoneNumber: number} = req.body;
           const data = await service.UpdateUserPhoneNumber({phoneNumber, uid: req.user?._id as string});
           const statusCode = data.success ? 200 : 500;
           return res.status(statusCode).json(data); 
        } catch (e) {
            console.log("Error while handling update-phoneNumber handler", e);
            return res.status(500).json({success: false, data: null, error: e})
        }
    })

    app.post("/user/phone-verification", auth, async(req, res)=>{
        try {
            const {otp, phoneNumber}: {otp: number, phoneNumber: number} = req.body;
            console.log(typeof phoneNumber)
            const data = await service.VerifyPhoneNumber({otp, phoneNumber, uid: req.user?._id as string});
            const statusCode = data.success ? 200 : 401;
            return res.status(statusCode).json(data);
        } catch (e) {
            console.log("Error while handling update-phoneNumber handler", e);
            return res.status(500).json({success: false, data: null, error: e})
        }
    })


    app.post("/user/internal/get-users-with-ids", async(req, res)=>{
        try {
            const {ids}: {ids: string[]} = req.body;
            const data = await service.FindUsersWithIDs({ids})
            return res.status(200).json(data)
        } catch (e) {
            console.log("Error while handling internal requeset of get users with ids", e);
            return res.status(500).json({success: false, data: null, error: e})            
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
  