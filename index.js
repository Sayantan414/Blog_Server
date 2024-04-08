const express = require("express");
const mongoose = require("mongoose");
const Port = process.env.PORT || 5000;
const app = express();

mongoose.connect("mongodb+srv://dipsadhu111:blogapp@blogapp.tosnqfm.mongodb.net/").then(() => console.log("connected to mongodb"));

app.use(express.json());
app.use("/uploads", express.static("uploads"));
const userRoute = require("./routes/user");
app.use("/user", userRoute);
const profileRoute = require("./routes/profile");
app.use("/profile", profileRoute);


app.route("/").get((req, res) => res.json("Your first rest api is here"));

app.listen(5000, () => console.log(`Server is running on ${Port}`));