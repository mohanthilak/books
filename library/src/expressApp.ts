import express, {Application} from "express";
import cors from 'cors';
import {CreateChannel, SubscribeMessage} from "./Infra/MeessageQueue/MessageQueue"

import {LibraryAPI} from "./api/Routes/Library_api"
import {BooksAPI} from "./api/Routes/Book_api"
import { RepositoryDependency, ServiceDependency } from "./dependencyClass";
import { BooksService, LibraryService } from "./services";
import { BooksRepository, LibraryRepository } from "./database";

export default async (app: Application)=>{
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cors({
        origin: ['http://localhost:3000', 'https://zipper-frontend.vercel.app'],
        methods: ['GET', 'POST'],
        credentials: true,
    }));
    app.use((req, res, next)=>{
        console.log("[",req.method, "],", req.url)
        next()
    })
    app.get("/", (req, res)=>{
        res.status(200).send("<h1>Welcome to Zipper-Libray</h1>")
    })
    const channel = await CreateChannel();
    
    const booksRepository = new BooksRepository();
    const libraryRepository = new LibraryRepository();
    const rd = new RepositoryDependency(booksRepository, libraryRepository);
    
    const booksService = new BooksService(booksRepository, libraryRepository);
    const libraryService = new LibraryService(libraryRepository);
    const sd = new ServiceDependency(booksService, libraryService);
    SubscribeMessage(channel, sd, rd);
    

    BooksAPI(app, channel, sd);
    LibraryAPI(app, channel, sd);
}