const amqplib = require("amqplib");
const {MESSAGE_BROKER_URL, COMMON_EXCHANGE, USER_EXCHANGE, GATEWAY_EXCHANGE, QUEUE_NAME, LIBRARY_BINDING_KEY, LIBRARY_EXCHANGE, GATEWAY_BINDING_KEY, } = require("../../config")

const createChannel = async () => {
    try{
            const connection = await amqplib.connect("amqp://localhost:5672");
        const channel = await connection.createChannel();
        await channel.assertExchange(COMMON_EXCHANGE, 'direct', {durable: true});
        await channel.assertExchange(USER_EXCHANGE, 'direct', {durable: true});
        await channel.assertExchange(LIBRARY_EXCHANGE, 'direct', {durable: true});
        await channel.assertExchange(GATEWAY_EXCHANGE, 'direct', {durable: true});
        // console.log("Channel;", channel)
        return channel;
        }catch(e) {
        console.log("Error while connecting to Message Queue", e);
        throw e;
    }
}

//Publish Messages
const PublishMessage = async (channel, binding_key, message, exchange)=>{
    try{
        // console.log(exchange, binding_key, message)s
        await channel.publish(exchange, binding_key, Buffer.from(message))
    }catch(e){
        console.log("error while publishing message to the queue", e)
    }
}


//Subscribe to Messages
const SubscribeMessage = async (channel)=>{
    try{
        const appQueue = await channel.assertQueue(QUEUE_NAME);

        channel.bindQueue(appQueue.queue, USER_EXCHANGE, USER_BINDING_KEY);
        channel.bindQueue(appQueue.queue, COMMON_EXCHANGE, COMMON_BINDING_KEY);
        channel.bindQueue(appQueue.queue, LIBRARY_EXCHANGE, LIBRARY_BINDING_KEY);
        channel.bindQueue(appQueue.queue, GATEWAY_EXCHANGE, GATEWAY_BINDING_KEY);
        
        const messageHandling = new messageHandling(SD, RD);
        
        channel.consume(appQueue.queue, data=> {
            console.log("received data");
            if(data){
                console.log(data.content.toString());
                const msg = JSON.parse(data.content.toString());
                console.log("LA", msg);
                messageHandling.HandleMessage(msg);
                // HandleMessagesFromBookService(msg);
                channel.ack(data);
            }
        })
    }catch(e){
        console.log(e);
    }
}



module.exports = { createChannel, PublishMessage, SubscribeMessage}