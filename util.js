import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET || "tHERE'S NO SPOON",
    {
      expiresIn: "10d",
    }
  );
};

export const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (authorization) {
    const token = authorization.slice(7);
    jwt.verify(
      token,
      process.env.JWT_SECRET || "tHERE'S NO SPOON",
      (err, decode) => {
        if (err) {
          res.status(401).send({ message: "Invalid token!" });
        } else {
          req.user = decode;
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: "No Token!" });
  }
};
