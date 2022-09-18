import amqplib, {Channel, ConsumeMessage} from "amqplib";
import {HandleMessagesFromBookService} from "./HandleMessages"

import {MESSAGE_BROKER_URL, EXCHANGE_NAME, USER_BINDING_KEY, BINDING_KEY_ARRAY} from "../config"

//Create a Channel
export const  CreateChannel = async ()=>{
    try{
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(EXCHANGE_NAME, 'direct', {durable: false});
        return channel;
    }catch(e){
        throw e;
    }
}


//Publish Messages
export const PublishMessage = async (channel:Channel, binding_key: string, message:string)=>{
    try{
        await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message))
    }catch(e){
        throw e;
    }
}

//Subscribe to Messages
export const SubscribeMessage = async (channel:Channel)=>{
    try{
        const appQueue = await channel.assertQueue('User_Queue');

        BINDING_KEY_ARRAY.forEach(bindingKey=>channel.bindQueue(appQueue.queue, EXCHANGE_NAME, bindingKey))

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