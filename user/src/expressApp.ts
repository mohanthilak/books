import express, {Application} from "express";
import cors from 'cors';
import {Channel} from "amqplib"

import {UserAPI} from "./api/routes/user_api"


export default (app: Application, channel: Channel)=>{
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
    }));

    UserAPI(app, channel)

}