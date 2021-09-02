/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
import asyncHandler from "express-async-handler";
import sampleData from "./resource/data.js";

// eslint-disable-next-line no-unused-vars
export default function routes(app, db) {
  app.route("/api/p/:productID").get(
    asyncHandler(async (req, res) => {
      const { productID } = req.params;
      const product = sampleData.products.find(
        (entry) => entry._id === productID
      );
      console.log("/api/p/:productID called");
      if (product !== undefined) {
        res.json(product);
      } else {
        res.send("Product not found.");
      }
    })
  );

  app.route("/api/p").get(
    asyncHandler(async (req, res) => {
      console.log("/api/p called");
      res.json(sampleData.products);
    })
  );
}
