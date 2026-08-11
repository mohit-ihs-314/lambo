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

// =====================================
// MONGODB CONNECTION
// =====================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => {

        console.log("MongoDB Connected");


        // =====================================
        // TEMPORARY ADMIN CREATION
        // =====================================

        try {

            const Admin =
                require("./models/Admin");

            const bcrypt =
                require("bcryptjs");


            const email =
                "admin@realestate.com";

            const password =
                "Admin@12345";


            // Check if admin already exists

            const existingAdmin =
                await Admin.findOne({
                    email,
                });


            if (existingAdmin) {

                console.log(
                    "Admin already exists:",
                    email
                );

            } else {

                // Hash password

                const hashedPassword =
                    await bcrypt.hash(
                        password,
                        12
                    );


                // Create admin

                await Admin.create({

                    name:
                        "Administrator",

                    email:
                        email,

                    password:
                        hashedPassword,

                });


                console.log(
                    "================================="
                );

                console.log(
                    "ADMIN CREATED SUCCESSFULLY"
                );

                console.log(
                    "Email:",
                    email
                );

                console.log(
                    "Password:",
                    password
                );

                console.log(
                    "================================="
                );

            }

        } catch (error) {

            console.error(
                "ADMIN CREATION ERROR:",
                error
            );

        }

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


const eventRoutes = require("./routes/eventRoutes");

app.use("/api/events", eventRoutes);

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