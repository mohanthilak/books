import {config} from 'dotenv'

console.log("NODE_ENV: ", process.env.NODE_ENV);

if(process.env.NODE_ENV !== 'prod'){
    config({path: './.dev.env'})
}else{
    config({path: './.env'});
}

export const PORT= <string>process.env.PORT;
export const DBURL = <string>process.env.DBURL;
export const ACCESS_TOKEN_SECRET = <string>process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = <string>process.env.REFRESH_TOKEN_SECRET;
export const MESSAGE_BROKER_URL = <string>process.env.MESSAGE_BROKER_URL;
export const EXCHANGE_NAME = "EXCHANGE_NAME";
export const QUEUE_NAME = "USER_QUEUE";
export const LIBRARY_BINDING_KEY = "LIBRARY_BINDING_KEY";
export const USER_BINDING_KEY = 'USER_BINDING_KEY';
export const BINDING_KEY_ARRAY = [LIBRARY_BINDING_KEY, ''];

console.log("At config level. PORT: ", PORT, " DBURL: ", DBURL);