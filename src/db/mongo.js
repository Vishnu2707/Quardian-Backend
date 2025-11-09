import mongoose from "mongoose";

export const connectMongo = async (uri) => {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo connection failed:", err.message);
    throw err;
  }
};
