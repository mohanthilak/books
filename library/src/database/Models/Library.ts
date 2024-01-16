import {DocumentType, getModelForClass, modelOptions, Ref, prop, Severity} from "@typegoose/typegoose"
import {Book} from "./index"


export class Location {
    @prop({required: true,enum: {type: "Point"},type:()=> String})
    type: string

    @prop({requied: true, type: ()=> [Number, Number]})
    coordinates: [number, number]
}

@modelOptions({
    schemaOptions: {
        timestamps:true
    }
})
export class Library{
    @prop({required: true})
    name: string
    
    @prop({required: true})
    owner: string

    @prop({ref: "Book", type: ()=>String})
    books: Ref<Book, string>[]

    @prop({required: true})
    location: Location

    @prop({})
    city: string
    
    @prop({})
    state: string
    
    @prop({})
    address: string

    @prop({})
    about: string

    @prop({default: 0})
    revenue: number
}

const  LibraryModel = getModelForClass(Library);
export {LibraryModel};