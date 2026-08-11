const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");

const router = express.Router();


// =====================================
// LOGIN
// =====================================

router.get("/test", (req, res) => {

    console.log("AUTH TEST ROUTE HIT");

    res.json({
        message: "Auth route is working",
        time: new Date().toISOString(),
    });

});

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        console.log("=================================");
        console.log("LOGIN ROUTE HIT");
        console.log("EMAIL:", email);
        console.log("PASSWORD RECEIVED:", !!password);


        if (!email || !password) {

            console.log("MISSING CREDENTIALS");

            return res.status(400).json({
                message:
                    "Email and password are required",
            });
        }


        const cleanEmail =
            email.trim().toLowerCase();


        console.log(
            "SEARCHING EMAIL:",
            cleanEmail
        );


        const admin =
            await Admin.findOne({
                email: cleanEmail,
            });


        console.log(
            "ADMIN FOUND:",
            !!admin
        );


        if (!admin) {

            console.log(
                "ADMIN NOT FOUND"
            );

            return res.status(401).json({
                message:
                    "Admin account not found",
            });

        }


        console.log(
            "ADMIN ID:",
            admin._id.toString()
        );

        console.log(
            "ADMIN EMAIL:",
            admin.email
        );

        console.log(
            "PASSWORD HASH EXISTS:",
            !!admin.password
        );


        const passwordMatch =
            await bcrypt.compare(
                password,
                admin.password
            );


        console.log(
            "PASSWORD MATCH:",
            passwordMatch
        );


        if (!passwordMatch) {

            console.log(
                "PASSWORD DOES NOT MATCH"
            );

            return res.status(401).json({
                message:
                    "Password is incorrect",
            });

        }


        if (!process.env.JWT_SECRET) {

            console.error(
                "JWT_SECRET IS MISSING"
            );

            return res.status(500).json({
                message:
                    "JWT_SECRET is not configured",
            });

        }


        const token =
            jwt.sign(
                {
                    id: admin._id,
                    email: admin.email,
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d",
                }
            );


        console.log(
            "LOGIN SUCCESS"
        );

        console.log("=================================");


        return res.json({

            message:
                "Login successful",

            token,

            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email,
            },

        });


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Login failed",
            error:
                error.message,
        });

    }

});


module.exports = router;