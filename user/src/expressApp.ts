import express, {Application} from "express";
import cors from 'cors';
import {Channel} from "amqplib"
import { UserRepository } from "./database";
import {UserAPI} from "./api/routes/user_api"
import { UserService } from "./services";


export default (app: Application, channel: Channel)=>{
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
    }));

    app.use((req, res, next)=>{
        console.log(req.url);
        next();
    })
    const repository = new UserRepository();
    const service = new UserService(repository)

    UserAPI(app, channel, service)

}