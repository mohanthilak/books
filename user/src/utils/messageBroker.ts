import amqplib from "amqplib";

import {MESSAGE_BROKER_URL, EXCHANGE_NAME, USER_BINDING_KEY} from "../config";

amqplib.connect(MESSAGE_BROKER_URL).then(connection=> connection.createChannel).then(channel => {
    
})
