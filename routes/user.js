const express = require("express");
const User = require("../models/users.models");
const config = require("../config");
const router = express.Router();
const jwt = require("jsonwebtoken");
const middleware = require("../middleware");

router.route("/register").post((req, res) => {
    console.log("inside the register");
    const user = new User({
        username: req.body.username,
        password: req.body.password,
        email: req.body.email
    });
    user
        .save()
        .then(() => {
            console.log("user registered");
            res.status(200).json("ok");
        })
        .catch((err) => {
            res.status(403).json({ msg: err });
        });
});

router.patch("/update/:username", middleware.checkToken, async (req, res) => {
    try {
        const username = req.params.username;
        const newPassword = req.body.password;

        // Find the user by username and update the password
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { password: newPassword },
            { new: true } // To return the updated document
        );

        if (!updatedUser) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Password successfully updated
        return res.json({
            msg: "Password successfully updated",
            username: username,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

router.delete("/delete/:username", middleware.checkToken, async (req, res) => {
    try {
        const username = req.params.username;
        const deletedUser = await User.findOneAndDelete({ username: username });

        if (!deletedUser) {
            return res.status(404).json({ msg: "User not found" });
        }
        return res.json({
            msg: "User deleted",
            username: username
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal server error" });
    }
});

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


router.post("/login", async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;

        // Find the user by username and password
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        // Check if the provided password matches the user's password
        if (user.password === password) {
            let token = jwt.sign({ username: req.body.username }, config.key, {
                expiresIn: "24h",
            })
            return res.json({ token: token, user });
        } else {
            return res.status(401).json({ msg: "Incorrect password" });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Internal server error" });
    }
});



module.exports = router;