/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
import asyncHandler from "express-async-handler";
import sampleData from "./resource/data.js";
import User from "./database/models/userModel.js";
import Product from "./database/models/productModel.js";

// eslint-disable-next-line no-unused-vars
export default function routes(app, db) {
  app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
  });

  app.route("/api/p/:productID").get(
    asyncHandler(async (req, res) => {
      const { productID } = req.params;
      // const product = sampleData.products.find(
      //   (entry) => entry._id === productID
      // );
      const product = await Product.findById(productID);

      console.log(`/api/p/${productID} called`);
      // if (product !== undefined) {
      //   res.json(product);
      // } else {
      //   res.status(404).json({ message: "Product Not Found" });
      // }
      if (product) {
        res.send(product);
      } else {
        res.status(404).json({ message: "Product Not Found" });
      }
    })
  );

  app.route("/api/p").get(
    asyncHandler(async (req, res) => {
      console.log("/api/p called");
      // res.json(sampleData.products);
      const products = await Product.find({});
      res.send(products);
    })
  );

  app.route("/initUser").get(
    asyncHandler(async (req, res) => {
      sampleData.users.map((user) => {
        User.findOne(user, (err, existUser) => {
          if (err) throw err;
          if (existUser) console.log(`User ${user.name} already exists.`);
          else {
            User.create(user, (err, createdUser) => {
              if (err) throw err;
              else console.log(`User ${createdUser.name} created.`);
            });
          }
        });
      });
      res.send(sampleData.users);
    })
  );

  app.route("/initProduct").get(
    asyncHandler(async (req, res) => {
      const createdProducts = Product.insertMany(sampleData.products);
      res.send({ createdProducts });
    })
  );

  app.route("/deleteUser").get(
    asyncHandler(async (req, res) => {
      User.deleteMany({}, (err, removeRes) => {
        if (err) res.send(err);
        else res.send(removeRes);
      });
    })
  );
}
