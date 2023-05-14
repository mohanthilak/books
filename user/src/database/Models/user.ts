import { DocumentType, getModelForClass, modelOptions, pre, prop,Ref, Severity, ReturnModelType } from "@typegoose/typegoose";
import bcrypt from "bcrypt";
// import {Library} from "./library"


@pre<User>("save", async function(){
    if(!this.isModified("password"))
        return;
    
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return;
})
@modelOptions({
    schemaOptions:{
        timestamps: true
    },
    options: {
        allowMixed: Severity.ALLOW //for a key in the schema to have multiple types.
    }
})
export class User {
    @prop({required: true, unique: true})
    username: string;

    @prop({require: true})
    password: string

    @prop()
    roles:string[];

    @prop()
    libraries: string[]; 

   async validatePassword(this: DocumentType<User>, CandidatePassword: string){
    try{
        return await bcrypt.compare(CandidatePassword, this.password);
    }catch(e){
        console.log(e);
        return false;
    }
   }
}

const UserModel = getModelForClass<typeof User>(User);


export {UserModel};
