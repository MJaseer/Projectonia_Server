import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import db from './Config/dbConnect.js'

import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

import { Server } from 'socket.io';
import { createServer } from "http";

import user from './Routes/user.js'
import admin from './Routes/admin.js'
import assignee from './Routes/assignee.js'
import chat from './Routes/chat.js'
import task from './Routes/task.js'
import project from './Routes/project.js'

const app = express()
import socketConnect from './Config/socketConnect.js';
import { verifyUser } from './Middlewares/verification.js'

app.use(morgan('dev'))

db()

const server = createServer(app);
const io = new Server(server, {
    pingTimeout: 60000,
    cors: {
        credentials: true,
        origin: process.env.allowedOrigins
    }
});

let activeUsers = {}
socketConnect(io, activeUsers)

app.use((req, res, next) => {
    res.set({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Headers": "'Access-Control-Allow-Headers: Origin, Content-Type, X-Auth-Token'",
    });

    next();
});

app.use(express.json())
app.use(cors({
    credentials: true,
    origin: process.env.allowedOrigins
}))


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())


app.use('/api', user)
app.use('/api/admin', admin)
app.use('/api/assignee', assignee)
app.use('/api/task', task)
app.use('/api/chat', chat)
app.use('/api/project', project)

server.listen(process.env.PORT, () => {
    console.log('Connected');
})
