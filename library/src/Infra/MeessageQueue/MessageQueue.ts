import amqplib, {Channel, ConsumeMessage} from "amqplib";

import {HandleMessagesFromBroker, MessageHandline} from "./HandleMessages"

import {MESSAGE_BROKER_URL, LIBRARY_EXCHANGE, QUEUE_NAME, COMMON_EXCHANGE, LIBRARY_BINDING_KEY, COMMON_BINDING_KEY} from "../../config"
import { RepositoryDependency, ServiceDependency } from "../../dependencyClass";

//Create a Channel
export const  CreateChannel = async ()=>{
    try{
        const connection = await amqplib.connect(MESSAGE_BROKER_URL);
        const channel = await connection.createChannel();
        await channel.assertExchange(LIBRARY_EXCHANGE, 'direct', {durable: true});
        await channel.assertExchange(COMMON_EXCHANGE, 'direct', {durable: true});
        return channel;
    }catch(e){
        throw e;
    }
}


//Publish Messages
export const PublishMessage = async (channel:Channel, binding_key: string, message:string, exchange:string)=>{
    try{
        await channel.publish(exchange, binding_key, Buffer.from(message))
        console.log("Published message", message)
    }catch(e){
        throw e;
    }
}

//Subscribe to Messages
export const SubscribeMessage = async (channel:Channel, sd:ServiceDependency, rd: RepositoryDependency)=>{
    try{
        const appQueue = await channel.assertQueue(QUEUE_NAME);

        channel.bindQueue(appQueue.queue, LIBRARY_EXCHANGE, LIBRARY_BINDING_KEY)
        channel.bindQueue(appQueue.queue, COMMON_EXCHANGE, COMMON_BINDING_KEY)
        const messageHandling = new MessageHandline(sd, rd);
        channel.consume(appQueue.queue, data=> {
            console.log("received data");
            if(data){
                const parsedData = JSON.parse(data.content.toString())
                console.log(parsedData);
                messageHandling.HandleMessage(parsedData);
                channel.ack(data);
		        // HandleMessagesFromBroker(parsedData)
            };  
        })
    }catch(e){
        console.log("error at subscribing messaging",e);
    }
}
