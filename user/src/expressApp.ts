import express, {Application} from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

import { UserRepository } from "./database";
import {UserAPI} from "./api/routes/user_api"
import { UserService } from "./services";
import {CreateChannel, SubscribeMessage} from "./utils"
import { RepositoryDependency, ServiceDependency } from "./dependencyClass";


export default async (app: Application )=>  {
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cookieParser())

    app.use(cors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true,
    }));

    app.use((req, res, next)=>{
        console.log("\n",req.url);
        next();
    })

    const channel = await CreateChannel();


    
    const repository = new UserRepository();
    const service = new UserService(repository);
    
    const SD = new ServiceDependency(service);
    const RD = new RepositoryDependency(repository);
    SubscribeMessage(channel, SD, RD);

    UserAPI(app, channel, service)

}