import express from "express";
import dotenv from "dotenv";
import routes from "./routes.js";
import mongoConnect from "./database/mongoConnect.js";

dotenv.config();
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
mongoConnect(process.env.MONGO_URI);

routes(app);

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
