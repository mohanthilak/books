import {config} from 'dotenv'
import path from 'path';

console.log("NODE_ENV: ", process.env.NODE_ENV);


switch (process.env.NODE_ENV) {
    case 'docker-dev':
        config({path: './docker-dev.env'})    
        break;
    case 'production':
        config({path: './.env'})
        break;
    case 'render':
        config({path: "./render.env"});
        break;
    default:
        config({path: './.env'})
        break;
}

// if(process.env.NODE_ENV === 'docker-dev'){
//     config({path: './docker-dev.env'})
// }else if(process.env.NODE_ENV !== 'production'){
//     config({path: './.dev.env'})
// }else if(process.env.NODE_ENV !== 'reder'){
//     config({path: './.render.env'})
// }else{
//     config({path: './.env'});
// }

export const PORT= <string>process.env.PORT;
export const DBURL = <string>process.env.DBURL;
export const ACCESS_TOKEN_SECRET = <string>process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = <string>process.env.REFRESH_TOKEN_SECRET;
export const MESSAGE_BROKER_URL = <string>process.env.MESSAGE_BROKER_URL;

export const NOTIFICATION_SERVICE_URL = <string>process.env.NOTIFICATION_SERVICE_URL;
export const LIBRARY_SERVICE_URL = <string>process.env.LIBRARY_SERVICE_URL;

export const COMMON_EXCHANGE = "COMMON_EXCHANGE";
export const USER_EXCHANGE = "USER_EXCHANGE";
export const LIBRARY_EXCHANGE = "LIBRARY_EXCHANGE";
export const NOTIFICATION_EXCHANGE = "NOTIFICATION_EXCHANGE";
export const GATEWAY_EXCHANGE = "GATEWAY_EXCHANGE";



export const QUEUE_NAME = "USER_QUEUE";

export const LIBRARY_BINDING_KEY = "LIBRARY_BINDING_KEY";
export const USER_BINDING_KEY = 'USER_BINDING_KEY';
export const COMMON_BINDING_KEY = 'COMMAN_BINDIN_KEY';
export const GATEWAY_BINDING_KEY = 'GATEWAY_BINDIN_KEY';
export const NOTIFICATION_BINDING_KEY = 'NOTIFICATION';

console.log("At config level. PORT: ", PORT, "Message Broker:", MESSAGE_BROKER_URL," DBURL: ", DBURL);