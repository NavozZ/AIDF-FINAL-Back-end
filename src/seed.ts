import "dotenv/config";
import connectDB from "./infrastructure/db";

import Hotel from "./infrastructure/entities/Hotel";
import Location from "./infrastructure/entities/Location";

// Sample hotels data (without _id and reviews - will be auto-generated)
const hotels = [
  {
    name: "Montmartre Majesty Hotel",
    description:
      "Experience the charm of Montmartre with this luxurious hotel. Enjoy stunning views of the city and the Eiffel Tower from your room.",
    image:
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/297840629.jpg?k=d20e005d5404a7bea91cb5fe624842f72b27867139c5d65700ab7f69396026ce&o=&hp=1",
    location: "Paris, France",
    rating: 4.7,
    price: 160,
  },
  {
    name: "Loire Luxury Lodge",
    description:
      "Experience the beauty of the Loire Valley with this luxurious hotel. Enjoy stunning views of the vineyards and the Loire River from your room.",
    image:
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/596257607.jpg?k=0b513d8fca0734c02a83d558cbad7f792ef3ac900fd42c7d783f31ab94b4062c&o=&hp=1",
    location: "Sydney, Australia",
    rating: 4.7,
    price: 200,
  },
  {
    name: "Tokyo Tower Inn",
    description:
      "Experience the beauty of Tokyo with this luxurious hotel. Enjoy stunning views of the city and the Tokyo Tower from your room.",
    image:
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/308797093.jpg?k=3a35a30f15d40ced28afacf4b6ae81ea597a43c90c274194a08738f6e760b596&o=&hp=1",
    location: "Tokyo, Japan",
    rating: 4.4,
    price: 250,
  },
  {
    name: "Sydney Harbor Hotel",
    description:
      "Experience the beauty of Sydney with this luxurious hotel. Enjoy stunning views of the city and the Sydney Harbor from your room.",
    image:
      "https://cf.bstatic.com/xdata/images/hotel/max1280x900/84555265.jpg?k=ce7c3c699dc591b8fbac1a329b5f57247cfa4d13f809c718069f948a4df78b54&o=&hp=1",
    location: "Sydney, Australia",
    rating: 4.8,
    price: 300,
  },
];

// Sample reviews data
const reviews = [
  {
    rating: 5,
    comment:
      "Absolutely amazing hotel! The views are breathtaking and the service is impeccable.",
  },
  {
    rating: 4,
    comment:
      "Great location and comfortable rooms. Would definitely recommend!",
  },
  {
    rating: 5,
    comment:
      "Perfect stay! The amenities are top-notch and the staff is very friendly.",
  },
  {
    rating: 4,
    comment:
      "Beautiful hotel with excellent facilities. The breakfast was delicious.",
  },
  {
    rating: 5,
    comment:
      "Outstanding experience! The room was spacious and the view was spectacular.",
  },
  {
    rating: 4,
    comment: "Very nice hotel with good service. The location is convenient.",
  },
  {
    rating: 5,
    comment: "Exceptional hotel! Everything exceeded our expectations.",
  },
  {
    rating: 4,
    comment: "Lovely stay! The hotel is clean and the staff is helpful.",
  },
];

// Sample locations data (extracted from hotel locations)
const locations = [
  { name: "France" },
  { name: "Australia" },
  { name: "Japan" },
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();

    // Clear existing data

    await Hotel.deleteMany({});
    await Location.deleteMany({});

    console.log("Cleared existing data");

    // Insert locations
    const createdLocations = await Location.insertMany(locations);
    console.log(`Created ${createdLocations.length} locations`);

    // Insert hotels
    const createdHotels = await Hotel.insertMany(hotels);
    console.log(`Created ${createdHotels.length} hotels`);

    console.log("Updated hotels with review references");
    console.log("Database seeded successfully!");

    // Display summary
    console.log("\n=== SEED SUMMARY ===");
    console.log(`Locations: ${createdLocations.length}`);
    console.log(`Hotels: ${createdHotels.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

// Run the seed script
seedDatabase();
