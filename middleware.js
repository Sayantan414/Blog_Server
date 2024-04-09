const jwt = require("jsonwebtoken");
const config = require("./config");

const checkToken = (req, res, next) => {
    let token = req.headers["authorization"];

    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).json({
            status: false,
            msg: "Token is not provided or invalid"
        });
    }

    token = token.slice(7);
    jwt.verify(token, config.key, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                status: false,
                msg: "Token is invalid"
            });
        } else {
            req.decoded = decoded;
            next();
        }
    });
};

module.exports = {
    checkToken: checkToken
}