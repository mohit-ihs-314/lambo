const express = require("express");
const axios = require("axios");

const authMiddleware =
    require("../middleware/authMiddleware");

const router = express.Router();


// =====================================================
// ELIE SAAB / EVENTIN ATTENDEES
// =====================================================

router.get(
    "/attendees",
    authMiddleware,
    async (req, res) => {

        try {

            console.log(
                "Fetching Elie Saab attendees..."
            );


            const response =
                await axios.get(
                    "https://ihsevents.in/wp-json/crm/v1/attendees",
                    {
                        headers: {
                            "X-CRM-SECRET":
                                process.env.WP_CRM_SECRET,
                        },
                    }
                );


            console.log(
                "Elie Saab attendees:",
                response.data.total
            );


            res.json(
                response.data
            );


        } catch (error) {

            console.error(
                "ELIE SAAB API ERROR:",
                error.response?.data ||
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch Elie Saab attendees",

            });

        }

    }
);


// =====================================================
// ON-SPOT ATTENDEES
// =====================================================

router.get(
    "/onspot",
    authMiddleware,
    async (req, res) => {

        try {

            console.log(
                "Fetching On-Spot attendees..."
            );


            const response =
                await axios.get(
                    "https://ihsevents.in/wp-json/crm/v1/onspot",
                    {
                        headers: {
                            "X-CRM-SECRET":
                                process.env.WP_CRM_SECRET,
                        },
                    }
                );


            console.log(
                "On-Spot attendees:",
                response.data.total
            );


            res.json(
                response.data
            );


        } catch (error) {

            console.error(
                "ONSPOT API ERROR:",
                error.response?.data ||
                error.message
            );


            res.status(500).json({

                success: false,

                message:
                    "Failed to fetch On-Spot attendees",

            });

        }

    }
);


module.exports = router;