import {config} from 'dotenv'

console.log("NODE_ENV: ", process.env.NODE_ENV);

// if(process.env.NODE_ENV === 'docker-dev'){
//     config({path: './docker-dev.env'})
// }else if(process.env.NODE_ENV !== 'production'){
//     config({path: './.dev.env'})
// }else{
//     config({path: './.env'});
// }
switch (process.env.NODE_ENV) {
    case 'docker-dev':
        config({path: './docker-dev.env'})    
        break;
    case 'production':
        config({path: './.dev.env'})
        break;
    case 'render':
        config({path: "./render.env"});
        break;
    default:
        config({path: './.env'})
        break;
}

export const PORT= <string>process.env.PORT;
export const DBURL = <string>process.env.DBURL;
export const ACCESS_TOKEN_SECRET = <string>process.env.ACCESS_TOKEN_SECRET;

// export const ACCESS_TOKEN_SECRET = <string>process.env.REFRESH_TOKEN_SECRET;
export const MESSAGE_BROKER_URL = <string>process.env.MESSAGE_BROKER_URL;

export const CLOUDINARY_SECRET = <string>process.env.CLOUDINARY_SECRET
export const CLOUDINARY_KEY = <string>process.env.CLOUDINARY_KEY
export const CLOUDINARY_CLOUD_NAME = <string>process.env.CLOUDINARY_CLOUD_NAME

export const NOTIFICATION_SERVICE_URL = <string>process.env.NOTIFICATION_SERVICE_URL
export const USER_SERVICE_URL = <string>process.env.USER_SERVICE_URL
export const REDIS_URL= <string>process.env.REDIS_URL;
export const REDIS_PASSWORD = <string>process.env.REDIS_PASSWORD;

export const COMMON_EXCHANGE = "COMMON_EXCHANGE";
export const USER_EXCHANGE = "USER_EXCHANGE";
export const LIBRARY_EXCHANGE = "LIBRARY_EXCHANGE";
export const NOTIFICATION_EXCHANGE = "NOTIFICATION_EXCHANGE";


export const LIBRARY_BINDING_KEY = "LIBRARY_BINDING_KEY";
export const USER_BINDING_KEY = 'USER_BINDING_KEY';
export const COMMON_BINDING_KEY = 'COMMAN_BINDIN_KEY';
export const NOTIFICATION_BINDING_KEY = 'NOTIFICATION';


export const QUEUE_NAME = 'Library_Queue';




console.log("At config level. PORT: ", PORT, " DBURL: ", DBURL, "accesstokensecrest", ACCESS_TOKEN_SECRET);