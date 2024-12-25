require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");

const { userRouter } = require("./routes/user");
const { courseRouter } = require("./routes/course");
const { adminRouter } = require("./routes/admin");
const app = express();
app.use(express.json());

app.use("/api/v1/user", userRouter);
app.use("/api/v1/admin", adminRouter);
app.use("/api/v1/course", courseRouter);

async function main() {
    const mongoUrl = process.env.MONGO_URL;
    if (!mongoUrl) {
        throw new Error("MONGO_URL is not defined in the .env file");
    }
    await mongoose.connect(mongoUrl);
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
}

main().catch(err => console.log(err));