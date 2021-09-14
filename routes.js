/* eslint-disable import/extensions */
/* eslint-disable no-underscore-dangle */
import asyncHandler from "express-async-handler";
import sampleData from "./resource/data.js";
import User from "./database/models/userModel.js";
import Product from "./database/models/productModel.js";
import { generateToken } from "./util.js";
import bcrypt from "bcrypt";

// eslint-disable-next-line no-unused-vars
export default function routes(app, db) {
  const salt = parseInt(process.env.SALT);

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

  app.route("/api/initUser").get(
    asyncHandler(async (req, res) => {
      sampleData.users.map((user) => {
        User.findOne({ email: user.email }, (err, existUser) => {
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

  app.route("/api/initProduct").get(
    asyncHandler(async (req, res) => {
      const createdProducts = Product.insertMany(sampleData.products);
      res.send({ createdProducts });
    })
  );

  app.route("/api/deleteUser").get(
    asyncHandler(async (req, res) => {
      User.deleteMany({}, (err, removeRes) => {
        if (err) res.send(err);
        else res.send(removeRes);
      });
    })
  );

  app.route("/api/signin").post(
    asyncHandler(async (req, res) => {
      const user = await User.findOne({ email: req.body.email });
      console.log(req.body);
      if (user) {
        console.log(req.body.password);
        if (bcrypt.compareSync(req.body.password, user.password)) {
          res.send({
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
            token: generateToken(user),
          });
          return;
        }
      }
      res.status(401).send({ message: "Invalid email or password" });
    })
  );

  app.route("/api/register").post(
    asyncHandler(async (req, res) => {
      const { password, name, email } = req.body;
      console.log(req.body);
      const existUser = User.findOne({ email: email });
      if (existUser.email) {
        console.log(`${existUser.email} already exist!`);
        res.status(409).send({ message: "User already exist!" });
      } else {
        const newUser = new User({
          name,
          email,
          password: bcrypt.hashSync(password, salt),
          isAdmin: false,
        });
        const savedUser = await newUser.save();
        res.send({
          _id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          isAdmin: savedUser.isAdmin,
          token: generateToken(savedUser),
        });
      }
    })
  );
}
