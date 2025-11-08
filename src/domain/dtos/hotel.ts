import { z } from "zod";

export const CreateHotelDTO = z.object({
  name: z.string(),
  image: z.string(),
  location: z.string(),
  price: z.number(),
  description: z.string(),
});
