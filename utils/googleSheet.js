const axios = require("axios");


// ==========================================
// SYNC LEAD TO GOOGLE SHEETS
// ==========================================

const syncLeadToGoogleSheet = async ({
    action = "upsert",
    lead,
}) => {

    try {

        const webhook =
            process.env.GOOGLE_SHEET_WEBHOOK_URL;

        const secret =
            process.env.GOOGLE_SHEET_SECRET;


        // Google Sheet sync disabled
        if (!webhook || !secret) {

            console.log(
                "Google Sheet sync not configured"
            );

            return;
        }


        const payload = {

            secret,

            action,

            leadId:
                lead._id?.toString(),

            clientName:
                lead.clientName || "",

            phone:
                lead.phone || "",

            status:
                lead.status || "New",

            notes:
                lead.notes || "",

            createdAt:
                lead.createdAt
                    ? new Date(
                        lead.createdAt
                    ).toISOString()
                    : "",

            updatedAt:
                lead.updatedAt
                    ? new Date(
                        lead.updatedAt
                    ).toISOString()
                    : "",

        };


        const response =
            await axios.post(
                webhook,
                payload,
                {
                    timeout: 15000,
                }
            );


        console.log(
            "Google Sheet sync:",
            response.data
        );


    } catch (error) {

        console.error(
            "Google Sheet sync failed:",
            error.response?.data ||
            error.message
        );

        // IMPORTANT:
        // Don't fail the lead operation
        // just because Google Sheet failed.
    }
};


module.exports = {
    syncLeadToGoogleSheet,
};