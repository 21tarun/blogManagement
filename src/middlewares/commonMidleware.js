const jwt = require("jsonwebtoken");

const auth = async function (req, res, next) {
    try {
        let token = req.headers["x-api-key"];
        if (!token) return res.status(400).send({ status: false, error: "missing mendatory header" });
        jwt.verify(token, "Extra Secret String", function (err, decodedToken) {
            if (err) return res.status(401).send({ status: false, message: err.message })
            if (decodedToken) {
                req.authorId = decodedToken._id
                next()
            } else {
                return res.status(401).send({ status: false, message: "Token is invalid" })
            }
        });
    } catch (error) {
        res.status(500).send({ status: false, error: error.message })
    }
}

module.exports.auth = auth