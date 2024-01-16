import { getModelForClass, modelOptions, prop, Prop, Ref, Severity } from "@typegoose/typegoose";
import {Library, Location} from "./index"
import mongoose, { Types } from "mongoose";

export class BorrowRequest {
    @prop({required:true, type:()=> String, unique: true})
    user: string
 
    @prop({required:true, type:()=> Number})
    timestamp: Number

    _id: string;
}

export class Reviews {
    @prop({required:true, type:()=> String, unique: true})
    userID: string
    
    @prop({required:true, type:()=> String})
    userName: string
    
    @prop({required:true, type:()=> String,})
    review: string
    
    @prop({required:true, type:()=> Number,})
    rating: number  
}

@modelOptions({
    schemaOptions: {
        timestamps:true
    }
})
export class Book {
    @prop({type:()=> String,required: true})
    name: string;
    
    @prop({type:()=> String, required: true})
    author: string;

    @prop({type: ()=>String})
    about: string;
    
    @prop({type: ()=>Reviews})
    Reviews: Ref<BorrowRequest>[];
    
    @prop({type:()=>String, default: ["https://m.media-amazon.com/images/I/81caWwaOOKL._AC_UF894,1000_QL80_.jpg"]})
    photos: string[];
    
    @prop({ref:"Library", type: ()=> String, required: true})
    library: Ref<Library, string>;

    @prop({type:()=> String,required: true})
    owner: string;


    @prop({type:()=> Number,required: true})
    mrp: number;

    @prop({type:()=> Number,required: true})
    priceOfBorrowing: number

    @prop({type:()=> Boolean, default: false})
    isBorrowed: boolean
    
    @prop({type:()=> Boolean, default: false})
    isIssued: boolean
    
    @prop({type:()=> String})
    issuesTo: string

    @prop({type:()=> String,default: undefined})
    lendTo: string

    @prop({required: true})
    location: Location

    @prop({type: ()=> String})
    previousOwners: string[];
    
    @prop({ref: ()=>BorrowRequest})
    borrowRequest: Ref<BorrowRequest>[]
}

const BookModel = getModelForClass(Book);
const BorrowRequestModel = getModelForClass(BorrowRequest);
export {BookModel, BorrowRequestModel}
