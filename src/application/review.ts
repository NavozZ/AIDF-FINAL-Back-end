import { Request, Response, NextFunction } from "express";
import Review from "../infrastructure/entities/Review";
import Hotel from "../infrastructure/entities/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import ForbiddenError from "../domain/errors/forbidden-error";
import { getAuth } from "@clerk/express";

const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { rating, comment, hotelId } = req.body;

    if (!rating || !comment || !hotelId) {
      throw new ValidationError("Rating, comment, and hotelId are required.");
    }
    if (comment.trim().length < 10) {
      throw new ValidationError("Comment must be at least 10 characters.");
    }

    const { userId } = getAuth(req);

    const hotel = await Hotel.findById(hotelId).populate("reviews");
    if (!hotel) {
      throw new NotFoundError("Hotel not found.");
    }

    // Prevent duplicate reviews from same user
    const existingReviews = await Review.find({
      _id: { $in: hotel.reviews },
      userId,
    });
    if (existingReviews.length > 0) {
      throw new ForbiddenError("You have already reviewed this hotel.");
    }

    const review = await Review.create({ rating, comment: comment.trim(), userId });

    hotel.reviews.push(review._id);

    // Recalculate hotel rating as the average of all reviews
    const allReviews = await Review.find({ _id: { $in: hotel.reviews } });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    hotel.rating = Math.round(avgRating * 10) / 10;

    await hotel.save();
    res.status(201).json({ message: "Review submitted successfully." });
  } catch (error) {
    next(error);
  }
};

const getReviewsForHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.hotelId;
    const hotel = await Hotel.findById(hotelId).populate("reviews");
    if (!hotel) {
      throw new NotFoundError("Hotel not found.");
    }
    res.status(200).json(hotel.reviews);
  } catch (error) {
    next(error);
  }
};

export { createReview, getReviewsForHotel };
