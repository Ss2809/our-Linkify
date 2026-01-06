require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");


const app = express();

const Signup = require("./routes/user");
const post = require("./routes/post");


mongoose
  .connect(process.env.DB)
  .then(() => console.log("Mongodb connect succfully!!"))
  .catch((err) => console.log("Error Occures mongodb connection!", err));

app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.json());


app.use("/api",Signup);
app.use("/api/post", post);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Running ${PORT}`));
