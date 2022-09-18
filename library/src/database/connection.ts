import {connect} from "mongoose"
import {DBURL} from "../config"

export const DBConnect = async ()=>{
    try{
        await connect(DBURL);
        console.log("DB Connected");
    }catch(e){
        console.log("DB Connection Error", e);
    }
}