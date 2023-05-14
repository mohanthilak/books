import {NextFunction, Request, Response} from "express";
import {AnyZodObject} from "zod"

const validateResources = (schema: AnyZodObject) =>
    (req: Request, res: Response, next: NextFunction) =>{
        try{
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params
            })
            
            next();
        }catch(e: any){
            const messages = e.errors.map((item: any)=>{
                
                return {message: item.message}
            })
            return res.status(400).json(messages)
        }
    }

export default validateResources