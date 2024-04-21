const express = require("express");
const User = require("../models/users.models");
const jwt = require("jsonwebtoken");
const config = require("../config");
const middleware = require('../middleware');

const router = express.Router();


router.get("/:username", middleware.checkToken, async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        return res.json({
            data: user,
            username: username
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

router.get("/checkusername/:username", async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username: username });

        if (user !== null) {
            return res.json({
                Status: true
            });
        } else {
            return res.json({
                Status: false
            })
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(403).json("Username incorrect");
        }

        if (user.password === password) {
            let token = jwt.sign({ username: req.body.username }, config.key, {
                expiresIn: "24h"
            })
            return res.json({ token: token, msg: "success", username: user.username, dp: user.dp });
        } else {
            return res.status(403).json("Password is incorrect");
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal server error" });
    }
});


router.route("/register").post((req, res) => {
    const { username, password, email, dp } = req.body;

    const user = new User({
        username: username,
        password: password,
        email: email,
        dp: dp
    });

    user.save()
        .then(() => {
            // Generate token
            const token = jwt.sign({ username: username }, config.key, {
                expiresIn: "24h"
            });
            res.status(200).json({
                username: username,
                dp: dp,
                token: token
            });
        })
        .catch((err) => {
            res.status(403).json({ msg: err });
        });
});


router.patch("/update/:username", middleware.checkToken, async (req, res) => {
    try {
        const username = req.params.username;
        const updateFields = req.body;

        const user = await User.findOneAndUpdate(
            { username: username },
            { $set: updateFields },
            { new: true } // To return the updated document
        );

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        return res.json({
            msg: "User information successfully updated",
            user: user,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal server error" });
    }
});


router.delete("/delete/:username", middleware.checkToken, async (req, res) => {
    try {
        const username = req.params.username;

        const user = await User.findOneAndDelete({ username: username });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        return res.json({
            msg: "User deleted",
            username: username,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal server error" });
    }
});


module.exports = router;