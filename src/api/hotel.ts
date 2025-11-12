import { Router } from "express";
import { 
    getAllHotels, 
    createHotel, 
    getHotelById, 
    updateHotel, 
    patchHotel,
    deleteHotel, 
    getAllHotelsBySearchQuery, 
} from "../application/hotel";
import authorizationMiddleware from "./middleware/authorization-middleware";
import isAuthenticated from "./middleware/authentication-middleware";
import { respondToAIQuery } from "../application/ai"; 

const router = Router();


router.get("/", getAllHotels); 


router.post("/ai-search", respondToAIQuery); 
router.get("/search", getAllHotelsBySearchQuery); 


router.get("/:_id", getHotelById); 



router.use(isAuthenticated, authorizationMiddleware); 

router.post("/", createHotel);
router.put("/:_id", updateHotel);
router.patch("/:_id", patchHotel);
router.delete("/:_id", deleteHotel);

export default router;