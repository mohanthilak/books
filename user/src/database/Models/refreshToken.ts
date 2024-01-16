import {DocumentType, getModelForClass, prop, Ref, modelOptions} from "@typegoose/typegoose";
import {User} from "./user"

@modelOptions({
    schemaOptions: {
        timestamps: true
    }
})
export class RefreshTokens {
    @prop({required: true, type: ()=>String})
    refreshToken: string

    @prop({ref:"User", type: ()=> String, required: true})
    user: Ref<User, string>;
    
    @prop({ expires: 86400 })
    public expiresAt?: Date;
}

const RefreshTokensModel = getModelForClass(RefreshTokens);
export {RefreshTokensModel};