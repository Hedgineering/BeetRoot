const {userModel} = require("../models/User");
const {roleModel} = require("../models/Role");
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.status(401).json({ message: "Unauthorized cookie" });
  const refreshToken = cookies.jwt;

  const foundUser = await userModel.findOne({ refreshToken }).exec();
  if (!foundUser) return res.status(403).json({ message: "Forbidden, no correlated user" });
  // evaluate jwt
  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if (err || foundUser.username !== decoded.username)
      return res.sendStatus(403);
    const allRoles = await roleModel.find({}).exec();
    const currentUserRoles = allRoles.filter((role) => foundUser.roles.includes(role._id)).map((role) => role.name);
    const accessToken = jwt.sign(
      {
        UserInfo: {
          username: decoded.username,
          roles: currentUserRoles,
        },
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: 60 }
    );
    res.json({ roles: currentUserRoles, accessToken });
  });
};

module.exports = { handleRefreshToken };
