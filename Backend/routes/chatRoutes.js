import express from "express"
import { getChatBotResponse } from "../controllers/chatController.js"

const router = express.Router() ;

router.post("/", getChatBotResponse) ;

export default router ;