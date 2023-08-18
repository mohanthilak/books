const {GATEWAY_BINDING_KEY, GATEWAY_EXCHANGE} = require("../../config")
let i=0;
class MessageHandling {
    channel
    inFlightRequests;
    constructor(channel, inFlightRequests){
        this.channel = channel;
        this.inFlightRequests = inFlightRequests;
    }

    async subscribeToEvenets(){
        const appQueue = await this.channel.assertQueue('GATEWAY_QUEUE');
        this.channel.bindQueue(appQueue.queue, GATEWAY_EXCHANGE, GATEWAY_BINDING_KEY);
        this.channel.consume(appQueue.queue, async (dat) =>{
            // console.log("received data", this.inFlightRequests);
            if(dat){
                // console.log(dat.content.toString());
                const msg = JSON.parse(dat.content.toString());
                console.log("Message received", msg.requestID);
                // console.log(msg);
                const storedRequset = this.inFlightRequests.get(msg.requestID);
                storedRequset?.responseCallback(msg);
                console.log(++i)
                // console.log("storedRequest",  storedRequset);
                this.channel.ack(dat);
            }
        })
    }
}

module.exports =  {MessageHandling};