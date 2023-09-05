import express from 'express'
import { createNewChatRoom, getAllMessageReceivers, getChatMessages, storeMessages } from '../Controllers/chatContoller.js'


const router = express.Router()

router.post('/createNewChatRoom', createNewChatRoom)

router.post('/storeMessages', storeMessages)

router.get('/getAllReceivers/:user_id', getAllMessageReceivers)

router.get('/getAllMessages/:sender_id/:receiver_id', getChatMessages)


export default router;