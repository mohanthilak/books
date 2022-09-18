import express, {Application} from "express";
import cors from 'cors';
import {Channel} from "amqplib"

import {LibraryAPI} from "./api/Routes/Library_api"
import {BooksAPI} from "./api/Routes/Book_api"

export default (app: Application, channel: Channel)=>{
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    app.use(cors({
        origin: ['http://localhost:3000'],
        methods: ['GET', 'POST'],
        credentials: true,
    }));

    BooksAPI(app, channel);
    LibraryAPI(app, channel);
}