import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const MONGODB_URL = "mongodb+srv://NavozZ:1234@cluster0.rsh5wff.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
    if (!MONGODB_URL) {
      throw new Error("MONGODB_URL is not defined");
    }
    await mongoose.connect(MONGODB_URL);
    console.log("Connected to MongoDB");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error connecting to MongoDB:", error.message);
    } else {
      console.error("Error connecting to MongoDB:", error);
    }
    process.exit(1);
  }
};

export default connectDB;
