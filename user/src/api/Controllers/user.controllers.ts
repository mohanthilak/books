// import { CreateUserInput } from "../../Schema/User.schema";
// import {Request, Response} from "express"
// import { UserService } from "../../services";


// class UserController {
//     #service: UserService
//     constructor(userService: UserService){
//         this.#service = userService;
//     }
    
//     async function SignUp((req: Request<{}, {}, CreateUserInput>, res: Response): any{
//         try{
//             console.log("GAYYYYYYYYYYy")
//             const {username, password} = req.body;
//             const data = await this.service.SignUp({username, password});
//             if(data.created){
//                 res.status(200).json(data);
//                 return 
//             }
//             res.json({data, status: 401});
//         }catch(e){
//             console.log("Error at api layer", e);
//             res.json({message: "Username already exists"})
//         }
//     })
// }