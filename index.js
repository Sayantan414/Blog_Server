const express = require("express");
const mongoose = require("mongoose");
const Port = process.env.port || 5000;
const app = express();

mongoose.connect("mongodb://localhost:27017/myapp").then(() => console.log("connected to mongodb"));

app.use(express.json());
const userRoute = require("./routes/user");
app.use("/user", userRoute);


app.route("/").get((req, res) => res.json("Your first rest api"));

app.listen(5000, () => console.log(`Server is running on ${Port}`));