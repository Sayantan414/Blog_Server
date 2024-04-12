const express = require("express");
const router = express.Router();
const BlogPost = require("../models/blogpost.model");
const middleware = require("../middleware");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        cb(null, req.params.id + ".jpg")
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
        fileSize: 1024 * 1024 * 6,
    },
    fileFilter: fileFilter
});

router.route("/add/coverImage/:id").patch(middleware.checkToken, upload.single("img"), async (req, res) => {
    try {
        const blogpost = await BlogPost.findOneAndUpdate(
            { _id: req.params.id },
            { $set: { coverImage: req.file.path } },
            { new: true }
        );
        return res.status(200).json({
            message: "Image added successfully",
            data: blogpost,
        });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: "Internal Server Error" });
    }
})

router.route("/Add").post(middleware.checkToken, (req, res) => {
    const blogpost = new BlogPost({
        username: req.decoded.username,
        title: req.body.title,
        body: req.body.body,
    });

    blogpost.save()
        .then((result) => {
            res.json({ data: result });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).json({ error: err.message });
        });
});

router.route("/getOwnBlog").get(middleware.checkToken, async (req, res) => {
    try {
        const result = await BlogPost.find({ username: req.decoded.username });
        return res.json({ data: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

router.route("/getOtherBlog").get(middleware.checkToken, async (req, res) => {
    try {
        const result = await BlogPost.find({ username: { $ne: req.decoded.username } });
        return res.json({ data: result });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});

router.route("/delete/:id").delete(middleware.checkToken, async (req, res) => {
    try {
        const result = await BlogPost.findOneAndDelete(
            {
                $and: [{ username: req.decoded.username }, { _id: req.params.id }]
            }
        );
        if (result) {
            console.log(result);
            return res.json("Blog deleted");
        } else {
            return res.json("Blog not found or already deleted");
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
    }
});



module.exports = router;