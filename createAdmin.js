const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const Admin = require("./models/Admin");


async function createAdmin() {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("MongoDB Connected");


        const email =
            "admin@realestate.com";

        const password =
            "Admin@12345";


        const existingAdmin =
            await Admin.findOne({ email });


        if (existingAdmin) {

            console.log(
                "Admin already exists"
            );

            process.exit();

        }


        const hashedPassword =
            await bcrypt.hash(password, 12);


        await Admin.create({
            name: "Administrator",
            email,
            password: hashedPassword,
        });


        console.log(
            "Admin created successfully"
        );

        console.log(
            "Email:",
            email
        );

        console.log(
            "Password:",
            password
        );


        process.exit();

    } catch (error) {

        console.error(error);

        process.exit(1);

    }

}


createAdmin();