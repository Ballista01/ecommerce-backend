/* eslint-disable no-underscore-dangle */
import asyncHandler from "express-async-handler";
import sampleData from "./resource/data.js";
import User from "./database/models/userModel.js";
import Product from "./database/models/productModel.js";
import { generateToken } from "./util.js";
import Order from "./database/models/orderModel.js";
import bcrypt from "bcrypt";
import { isAuth } from "./util.js";

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
      //   (entry) => entry.id === productID
      // );
      const product = await Product.findById(productID);

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
          else {
            User.create(user, (err, createdUser) => {
              if (err) throw err;
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
      if (user) {
        if (bcrypt.compareSync(req.body.password, user.password)) {
          res.send({
            id: user._id,
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
      const existUser = User.findOne({ email: email });
      if (existUser.email) {
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
          id: savedUser._id,
          name: savedUser.name,
          email: savedUser.email,
          isAdmin: savedUser.isAdmin,
          token: generateToken(savedUser),
        });
      }
    })
  );

  app.route("/api/order").post(
    isAuth,
    asyncHandler(async (req, res) => {
      const {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        user,
      } = req.body;
      if (orderItems === 0) {
        res.status(400).send({ message: "Order is empty." });
      } else {
        const order = new Order({
          orderItems,
          shippingAddress,
          paymentMethod,
          itemsPrice,
          shippingPrice,
          taxPrice,
          totalPrice,
          user,
        });
        const createdOrder = await order.save();
        res
          .status(201)
          .send({ message: "New Order Placed", order: createdOrder });
      }
    })
  );

  app.route("/api/order/:orderID").get(
    isAuth,
    asyncHandler(async (req, res) => {
      const order = await Order.findById(req.params.orderID);
      if (order) {
        if (order.user.equals(req.user.id)) res.send(order);
        else res.status(401).send({ message: "User not authorized!" });
      } else {
        res.status(404).send({ message: "Order not found!" });
      }
    })
  );

  app.route("/api/config/paypal").get((req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || "sandbox");
  });

  app.route("/api/orderhistory").get(
    isAuth,
    asyncHandler(async (req, res) => {
      const userOrders = await Order.find({
        user: req.user.id,
      });
      res.send(userOrders);
    })
  );

  app
    .route("/api/user/:id")
    .get(
      isAuth,
      asyncHandler(async (req, res) => {
        if (req.params.id === req.user.id) {
          const user = await User.findById(req.user.id);
          if (user) {
            user.set("password", null);
            res.send(user);
          } else {
            res.status(404).send({ message: "user not found" });
          }
        } else {
          res.status(401).send({ message: "unauthorized access" });
        }
      })
    )
    .put(
      isAuth,
      asyncHandler(async (req, res) => {
        if (req.params.id === req.user.id) {
          const user = await User.findById(req.user.id);
          const { name, email, password } = req.body;
          user.name = name || user.name;
          user.email = email || user.email;
          if (password) {
            user.password = bcrypt.hashSync(password, salt);
          }
          user.save((err, savedUser) => {
            if (err) res.status(500).send({ message: err });
            else {
              res.send({
                id: savedUser.id,
                name: savedUser.name,
                email: savedUser.email,
                isAdmin: savedUser.isAdmin,
                token: generateToken(savedUser),
              });
            }
          });
        } else {
          res.status(401).send({ message: "unauthorized access" });
        }
      })
    );
}
