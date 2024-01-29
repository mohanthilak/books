import {getModelForClass, prop, Ref, modelOptions} from "@typegoose/typegoose";
import {User} from "./user"

@modelOptions({
    schemaOptions: {
        timestamps: true
    }
})
export class Transactions {
    @prop({required: true, type: ()=>Number})
    amount: number

    @prop({required: true, default:"initiated", type: ()=>String, enum: ["initiated", "completed", "failed"]})
    status: string

    @prop({ref:"User", type: ()=> String, required: true})
    initiator: Ref<User, string>;
    
    @prop({ref:"User", type: ()=> String, required: true})
    recipient: Ref<User, string>;
    
}

const TransactionsModel = getModelForClass(Transactions);
export {TransactionsModel};