const express = require("express");
const router = express.Router();
const Profile = require("../models/profile.model");
const middleware = require("../middleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, req.decoded.username + ".jpg")
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype == "image/jpeg" || file.mimetype == "image/png") {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 10,
    },
    fileFilter: fileFilter
});

router.route("/add/image").patch(middleware.checkToken, upload.single("img"), async (req, res) => {
    try {
        const profile = await Profile.findOneAndUpdate(
            { username: req.decoded.username },
            { $set: { img: req.file.path } },
            { new: true }
        );
        if (!profile) {
            return res.status(404).json({ message: "Profile not found" });
        }
        return res.status(200).json({
            message: "Image added successfully",
            data: profile,
        });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
});


router.route("/add").post(middleware.checkToken, (req, res) => {
    const profile = Profile({
        username: req.decoded.username,
        name: req.body.name,
        profession: req.body.profession,
        DOB: req.body.DOB,
        titleline: req.body.titleline,
        about: req.body.about
    });
    profile.save()
        .then(() => {
            return res.json({ msg: "Profile successfully stored" });
        })
        .catch((err) => {
            return res.status(400).json({ error: err.message });
        });
});

router.route("/checkProfile").get(middleware.checkToken, async (req, res) => {
    try {
        const result = await Profile.findOne({ username: req.decoded.username });
        if (!result) {
            return res.status(404).json({ status: false, message: "Profile not found" });
        }
        return res.status(200).json({ status: true, message: "Profile found" });
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error", details: err });
    }
});


router.route("/getData").get(middleware.checkToken, async (req, res) => {
    try {
        const result = await Profile.findOne({ username: req.decoded.username });
        if (!result) {
            return res.status(404).json({ data: null });
        }
        return res.status(200).json({ data: result });
    } catch (err) {
        return res.status(500).json({ error: "Internal Server Error", details: err });
    }
});


router.route("/update").patch(middleware.checkToken, async (req, res) => {
    try {
        let profile = await Profile.findOne({ username: req.decoded.username });
        if (!profile) {
            return res.json({ data: [] });
        }
        profile.name = req.body.name || profile.name;
        profile.profession = req.body.profession || profile.profession;
        profile.DOB = req.body.DOB || profile.DOB;
        profile.titleline = req.body.titleline || profile.titleline;
        profile.about = req.body.about || profile.about;
        const updatedProfile = await profile.save();
        return res.json({ data: updatedProfile });
    } catch (err) {
        return res.json({ err: err });
    }
});



module.exports = router;