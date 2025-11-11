
import { Router } from "express";
import asyncHandler from "express-async-handler";
import { createCheckoutSession, retrieveSessionStatus, handleWebhook } from "../application/payment";

const router = Router();


router.post(
    "/create-checkout-session",
    asyncHandler(async (req, res) => {
        
        const result = await createCheckoutSession(req); 
        
        res.status(200).json(result);
    })
);


router.get(
    "/session-status",
    asyncHandler(async (req, res) => {
        
        const sessionStatus = await retrieveSessionStatus(req);
        res.status(200).json(sessionStatus);
    })
);


router.post(
    "/webhook",
    asyncHandler(async (req, res) => {
        
        await handleWebhook(req, res);
    })
);

export default router;