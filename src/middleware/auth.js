const jwt = require("jsonwebtoken");
const { User } = require("../models/_User");

const auth = async (req, res, next) => {
  try {
    const token = req.header("authorization").replace("Bearer ", "");
    const tokenDecoded = decodeToken(token);
    const user = await User.findOne({
      _id: tokenDecoded.id,
      token: tokenDecoded.token,
    });
    //
    if (!user) {
      throw new Error();
    }
    //
    req.token = token;
    req.user = user;
    //
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate!" });
  }
};

const decodeToken = (token) => {
  const decoded = jwt.verify(
    token,
    "dana-booking"
  );
  return {
    token,
    ...decoded,
  };
};
module.exports = { auth };
