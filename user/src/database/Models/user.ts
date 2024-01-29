import { DocumentType, getModelForClass, modelOptions, pre, prop,Ref, Severity, ReturnModelType } from "@typegoose/typegoose";
import bcrypt from "bcrypt";
import { Wallet } from "./Wallet";
// import {Library} from "./library"

export class Location {
    @prop({required: true,enum: {type: "Point"},type:()=> String})
    type: string

    @prop({requied: true, type: ()=> [Number, Number]})
    coordinates: [number, number]
}

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
    @prop({unique: true})
    email: string;

    @prop({})
    password: string

    @prop({default:"Phineas"})
    name: string
    
    @prop({})
    googleID: string

    @prop({type: ()=>[String], default: ['phone-verification', 'email-verification', 'name-entry'],enum:['phone-verification', 'email-verification', 'name-entry']})
    verificationStatus: string[]

    @prop({default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOaEB7ZWMMO32jsII22Bl8QGs5wxZpkhOQ3AjGp0DZqbXNuzJUX5PyyecGy2JeYd0kiVk&usqp=CAU"})
    profilePicture: string
    
    @prop({})
    phoneNumber: number
    
    @prop({required: true, default:0})
    deposit: number

    @prop()
    libraries: string[];

    @prop()
    currentLocation: Location

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
