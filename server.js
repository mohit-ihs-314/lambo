const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();


// =====================================
// MIDDLEWARE
// =====================================

app.use(
    cors({
        origin: true,
        credentials: true,
    })
);

app.use(express.json());


// =====================================
// BASIC TEST
// =====================================

app.get("/", (req, res) => {

    res.json({
        message: "Server is working",
    });

});


// =====================================
// MONGODB CONNECTION
// =====================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {

        console.log("MongoDB Connected");

    })
    .catch((error) => {

        console.error(
            "MongoDB Connection Error:",
            error
        );

    });


// =====================================
// AUTH ROUTES
// =====================================

const authRoutes =
    require("./routes/authRoutes");

app.use(
    "/api/auth",
    authRoutes
);


// =====================================
// LEAD ROUTES
// =====================================

const leadRoutes =
    require("./routes/leadRoutes");

console.log(
    "Lead routes loaded successfully"
);

app.use(
    "/api/leads",
    leadRoutes
);


// =====================================
// 404 HANDLER
// =====================================

app.use((req, res) => {

    console.log(
        "404 REQUEST:",
        req.method,
        req.originalUrl
    );

    res.status(404).json({
        message: "Route not found",
        path: req.originalUrl,
    });

});


// =====================================
// ERROR HANDLER
// =====================================

app.use((err, req, res, next) => {

    console.error(
        "SERVER ERROR:",
        err
    );

    res.status(500).json({
        message: "Internal server error",
    });

});


// =====================================
// SERVER
// =====================================

const PORT =
    process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});