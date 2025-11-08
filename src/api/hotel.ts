import express from "express";
import { Request, Response, NextFunction } from "express";

import {
  getAllHotels,
  createHotel,
  getHotelById,
  updateHotel,
  patchHotel,
  deleteHotel,
} from "../application/hotel";
import isAuthenticated from "./middleware/authentication-middleware";
import isAdmin from "./middleware/authorization-middleware";

const hotelsRouter = express.Router();

const preMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(req.method, req.url);
  next();
};

hotelsRouter.route("/").get(getAllHotels).post(isAuthenticated,isAdmin,createHotel);

hotelsRouter
  .route("/:_id")
  .get(isAuthenticated, getHotelById)
  .put(updateHotel)
  .patch(patchHotel)
  .delete(deleteHotel);

export default hotelsRouter;
