import Hotel from "../infrastructure/entities/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { generateEmbedding } from "./utils/embeddings";
import { CreateHotelDTO, SearchHotelDTO } from "../domain/dtos/hotel";
import { Request, Response, NextFunction } from "express";

export const getAllHotels = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sortBy, minPrice, maxPrice } = req.query;
    const filter: any = {};
    const sortOptions: { [key: string]: 1 | -1 } = {};

    const minP = Number(minPrice);
    const maxP = Number(maxPrice);

    if (!isNaN(minP) || !isNaN(maxP)) {
      filter.price = {};
      if (!isNaN(minP)) filter.price.$gte = minP;
      if (!isNaN(maxP)) filter.price.$lte = maxP;
    }

    if (typeof sortBy === "string") {
      const [field, order] = sortBy.split("_");
      if (field && (order === "asc" || order === "desc")) {
        sortOptions[field] = order === "asc" ? 1 : -1;
      } else if (field === "rating") {
        sortOptions.rating = order === "asc" ? 1 : -1;
      }
    }

    if (Object.keys(sortOptions).length === 0) sortOptions.name = 1;

    const hotels = await Hotel.find(filter).sort(sortOptions);
    res.status(200).json(hotels);
  } catch (error) {
    next(error);
  }
};

export const getAllHotelsBySearchQuery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = SearchHotelDTO.safeParse(req.query);
    if (!result.success) throw new ValidationError(`${result.error.message}`);
    const { query } = result.data;
    const queryEmbedding = await generateEmbedding(query);
    const hotels = await Hotel.aggregate([
      {
        $vectorSearch: {
          index: "hotel_vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 25,
          limit: 4,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          location: 1,
          price: 1,
          image: 1,
          rating: 1,
          reviews: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);
    res.status(200).json(hotels);
  } catch (error) {
    next(error);
  }
};

export const createHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hotelData = req.body;
    const result = CreateHotelDTO.safeParse(hotelData);
    if (!result.success) throw new ValidationError(`${result.error.message}`);
    const embedding = await generateEmbedding(
      `${result.data.name} ${result.data.description} ${result.data.location} ${result.data.price}`
    );
    await Hotel.create({ ...result.data, embedding });
    res.status(201).send();
  } catch (error) {
    next(error);
  }
};

export const getHotelById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _id = req.params._id;
    const hotel = await Hotel.findById(_id);
    if (!hotel) throw new NotFoundError("Hotel not found");
    res.status(200).json(hotel);
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _id = req.params._id;
    const hotelData = req.body;
    const result = CreateHotelDTO.safeParse(hotelData);
    if (!result.success) throw new ValidationError("Invalid hotel data: All required fields must be present.");
    const updatedHotel = await Hotel.findByIdAndUpdate(_id, result.data, { new: true });
    if (!updatedHotel) throw new NotFoundError("Hotel not found");
    res.status(200).json(updatedHotel);
  } catch (error) {
    next(error);
  }
};

export const deleteHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _id = req.params._id;
    const result = await Hotel.findByIdAndDelete(_id);
    if (!result) throw new NotFoundError("Hotel not found");
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

export const patchHotel = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const _id = req.params._id;
    const hotelData = req.body;
    if (!hotelData.price) throw new ValidationError("Price is required");
    const hotel = await Hotel.findById(_id);
    if (!hotel) throw new NotFoundError("Hotel not found");
    await Hotel.findByIdAndUpdate(_id, { price: hotelData.price });
    res.status(200).send();
  } catch (error) {
    next(error);
  }
};
