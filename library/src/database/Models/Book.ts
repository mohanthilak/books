import { getModelForClass, modelOptions, prop, Prop, Ref, Severity } from "@typegoose/typegoose";
import {Library, Location} from "./index"
import mongoose from "mongoose";

export class BorrowRequest {
    @prop({required:true, type:()=> String})
    user: string
 
    @prop({required:true, type:()=> String})
    timestamp: Number
}

@modelOptions({
    schemaOptions: {
        timestamps:true
    }
})
export class Book {
    @prop({required: true})
    name: string;
    
    @prop({required: true})
    author: string;
    
    @prop({ref:"Library", type: ()=> String, required: true})
    library: Ref<Library, string>;

    @prop({required: true})
    owner: string;

    @prop({required: true})
    mrp: number;

    @prop({required: true})
    priceOfBorrowing: number

    @prop({ default: false})
    isBorrowed: boolean

    @prop({default: undefined})
    lendTo: string

    @prop({required: true})
    location: Location

    @prop({type: ()=> String})
    previousOwners: string[];
    
    @prop()
    borrowRequest: BorrowRequest[]
}

const BookModel = getModelForClass(Book);
export {BookModel}
