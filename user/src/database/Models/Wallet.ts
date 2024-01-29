import {DocumentType, getModelForClass, prop, Ref, modelOptions} from "@typegoose/typegoose";
import {User} from "./user"
import { Transactions } from "./Transactions";

@modelOptions({
    schemaOptions: {
        timestamps: true
    }
})
export class Wallet {
    @prop({required: true, type: ()=>Number})
    amount: number

    @prop({ref:"User", type: ()=> String, required: true, unique: true})
    owner: Ref<User, string>;
    
    @prop({ref:"Transactions", type: ()=> [String], required: true})
    transactions: Ref<Transactions, string>[];
}

const WalletModel = getModelForClass(Wallet);
export {WalletModel};