const express = require("express");
const axios = require("axios");

const router = express.Router();


// GET EVENT ATTENDEES
router.get("/attendees", async (req, res) => {

    try {

        const response = await axios.get(
            "https://ihsevents.in/wp-json/crm/v1/attendees",
            {
                headers: {
                    "X-CRM-SECRET":
                        process.env.WP_CRM_SECRET,
                },
            }
        );

        res.json(response.data);

    } catch (error) {

        console.error(
            "Event API Error:",
            error.response?.data ||
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Unable to fetch event attendees",
        });
    }
});


module.exports = router;