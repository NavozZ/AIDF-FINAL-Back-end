import { Router } from "express";
import { 
    getAllHotels, 
    createHotel, 
    getHotelById, 
    updateHotel, 
    deleteHotel, 
    getAllHotelsBySearchQuery,
    patchHotel,
} from "../application/hotel";
import authorizationMiddleware from "./middleware/authorization-middleware";
import isAuthenticated from "./middleware/authentication-middleware";

const router = Router();

router.get("/", getAllHotels);
router.get("/:_id", getHotelById);
router.get("/search", getAllHotelsBySearchQuery);

router.use(isAuthenticated, authorizationMiddleware);

router.post("/", createHotel);
router.put("/:_id", updateHotel);
router.patch("/:_id", patchHotel);
router.delete("/:_id", deleteHotel);

export default router;
