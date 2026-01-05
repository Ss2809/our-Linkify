require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

const Signup = require("./routes/user");


mongoose
  .connect(process.env.DB)
  .then(() => console.log("Mongodb connect succfully!!"))
  .catch((err) => console.log("Error Occures mongodb connection!", err));

app.use(cors());
app.use(express.json());


app.use("/api",Signup);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server Running ${PORT}`));
