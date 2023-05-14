import amqplib, {Channel, ConsumeMessage} from "amqplib";
import {HandleMessagesFromBookService} from "./HandleMessages"

import {MESSAGE_BROKER_URL, USER_EXCHANGE, COMMON_EXCHANGE, USER_BINDING_KEY, COMMON_BINDING_KEY} from "../config"

//Create a Channel
export const  CreateChannel = async ()=>{
    try{
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(COMMON_EXCHANGE, 'direct', {durable: true});
        await channel.assertExchange(USER_EXCHANGE, 'direct', {durable: true});
        return channel;
    }catch(e){
        throw e;
    }
}


//Publish Messages
export const PublishMessage = async (channel:Channel, binding_key: string, message:string, exchange:string)=>{
    try{
        await channel.publish(exchange, binding_key, Buffer.from(message))
    }catch(e){
        throw e;
    }
}

//Subscribe to Messages
export const SubscribeMessage = async (channel:Channel)=>{
    try{
        const appQueue = await channel.assertQueue('User_Queue');

        channel.bindQueue(appQueue.queue, USER_EXCHANGE, USER_BINDING_KEY)
        channel.bindQueue(appQueue.queue, COMMON_EXCHANGE, COMMON_BINDING_KEY)

        channel.consume(appQueue.queue, data=> {
            console.log("received data");
            if(data){
                console.log(data.content.toString());
                const la = JSON.parse(data.content.toString());
                console.log("LA", la);
                HandleMessagesFromBookService(la);
                channel.ack(data);
            }
        })
    }catch(e){
        console.log(e);
    }
}