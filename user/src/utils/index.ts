import amqplib, {Channel} from "amqplib";
import {HandleMessagesFromBookService} from "./HandleMessages"
import { MessageHandline } from "./HandleMessages";

/**
 * Exchange is this entry point of the producers. The producers most oftenly produce the message to the exchange and forget about it. 
 * The message is then pushed to the respective queues based on the binding key.
 */
/**
 * Common Exchange is used to share messages to all services. 
 * For example: debaring a user after the user logs out.
 */

import {MESSAGE_BROKER_URL, USER_EXCHANGE, COMMON_EXCHANGE, GATEWAY_EXCHANGE, GATEWAY_BINDING_KEY, USER_BINDING_KEY, COMMON_BINDING_KEY, LIBRARY_EXCHANGE, LIBRARY_BINDING_KEY} from "../config"
import { RepositoryDependency, ServiceDependency } from "../dependencyClass";

//Create a Channel
export const  CreateChannel = async ()=>{
    try{
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(COMMON_EXCHANGE, 'direct', {durable: true});
        await channel.assertExchange(USER_EXCHANGE, 'direct', {durable: true});
        await channel.assertExchange(GATEWAY_EXCHANGE, 'direct', {durable: true});
        // await channel.assertExchange(LIBRARY_EXCHANGE, 'direct', {durable: true});
        channel.prefetch(1);
        return channel;
    }catch(e){
        console.log("Error while connecting to Message Queue", e)
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
export const SubscribeMessage = async (channel:Channel, SD: ServiceDependency, RD: RepositoryDependency)=>{
    try{
        const appQueue = await channel.assertQueue('User_Queue');

        channel.bindQueue(appQueue.queue, USER_EXCHANGE, USER_BINDING_KEY);
        channel.bindQueue(appQueue.queue, COMMON_EXCHANGE, COMMON_BINDING_KEY);
        // channel.bindQueue(appQueue.queue, GATEWAY_EXCHANGE, GATEWAY_BINDING_KEY);
        // channel.bindQueue(appQueue.queue, LIBRARY_EXCHANGE, LIBRARY_BINDING_KEY);
        
        const messageHandling = new MessageHandline(channel, SD, RD);
        
        channel.consume(appQueue.queue, async data=> {
            if(data){
                // console.log()
                // console.log(data.content.toString());
                const msg = JSON.parse(data.content.toString());
                console.log("received data", msg);
                // console.log("LA", msg);
                await messageHandling.HandleMessage(msg);
                // HandleMessagesFromBookService(msg);
                channel.ack(data);
            }
        })
    }catch(e){
        console.log(e);
    }
}