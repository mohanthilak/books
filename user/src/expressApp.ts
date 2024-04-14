import express, {Application} from "express";
import cors from 'cors';
import cookieParser from "cookie-parser";

import { TransactionRepo, UserRepository } from "./database";
import {UserAPI} from "./api/routes/user_api"
import { UserService } from "./services";
import {CreateChannel, SubscribeMessage} from "./utils"
import { RepositoryDependency, ServiceDependency } from "./dependencyClass";
import { Channel } from "amqplib";
import { TransactionService } from "./services/Transaction_Service";
import { TransactionsAPI } from "./api/routes/transaction_api";
import { WalletRepository } from "./database/Repositories/Wallet_Repository";
import { WalletService } from "./services/Wallet_Service";
import { WalletAPI } from "./api/routes/wallet_api";


export default async (app: Application )=>  {
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cookieParser())

    app.use(cors({
        origin: ['http://localhost:3000', "https://zipper-frontend.vercel.app"],
        methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
        credentials: true,
    }));

    app.use((req, res, next)=>{
        console.log("\n",req.url);
        next();
    })

    app.get("/", (req,res)=>{
        res.status(200).send("<h1>Welcome to Zipper User API</h1>")
    })

    let channel: Channel;
    try{
        channel = await CreateChannel();
        const repository = new UserRepository();
        const transactionRepository = new TransactionRepo();
        const walletRepository = new WalletRepository();

        const userService = new UserService(repository);
        const transactionService = new TransactionService(transactionRepository);
        const walletService = new WalletService(walletRepository)

        const SD = new ServiceDependency(userService, transactionService, walletService);
        const RD = new RepositoryDependency(repository);
        SubscribeMessage(channel, SD, RD);

        UserAPI(app, channel, userService);
        TransactionsAPI(app, SD);
        WalletAPI(app, SD)
    }catch(e){
        console.log("error in creating a new rabbitmq channel", e)
    }


    
    

}
