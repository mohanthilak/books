import {connect} from "mongoose"
import {DBURL} from "../config"

export const DBConnect = async ()=>{
    let times = 5;
    while(times > 0){
        try{
            await connect(DBURL);
            console.log("DB Connected");
            break;
        }catch(e){
            console.log("DB Connection Error", e);
            times--;
            await new Promise(res => setTimeout(res, 1000))
        }
    }
}