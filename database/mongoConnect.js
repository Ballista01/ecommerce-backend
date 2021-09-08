import mongoose from "mongoose";

export default function (mongoURI) {
  try {
    mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.once("open", () => console.log("MongoDB Atlas connected!"));
    return db;
  } catch (error) {
    console.log(error);
  }
}
