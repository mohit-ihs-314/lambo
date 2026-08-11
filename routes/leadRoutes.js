const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");


// =====================================
// LEAD SCHEMA
// =====================================

const leadSchema = new mongoose.Schema(
    {
        clientName: {
            type: String,
            required: true,
        },

        phone: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "New",
                "Interested",
                "Not Interested",
                "Closed",
            ],
            default: "New",
        },

        photo: {
            type: String,
            default: "",
        },

        rmName: {
            type: String,
            default: "",
        },

        project: {
            type: String,
            default: "",
        },

        notes: {
            type: String,
            default: "",
        },
    },
    {
        timestamps: true,
    }
);


// =====================================
// COLLECTION MAPPING
// =====================================

const allowedCollections = {
    investor: "investor_leads",
    lambo: "lambo_leads",
    loft: "loft_leads",
    omaxe: "omaxe_leads",
};


// =====================================
// TEST ROUTE
// =====================================

router.get("/", (req, res) => {

    res.json({
        message: "Lead API is working",

        availableCollections:
            Object.keys(allowedCollections),
    });

});


// =====================================
// GET LEADS BY COLLECTION
// =====================================

router.get(
    "/:collection",
    authMiddleware,
    async (req, res) => {

        try {

            const { collection } = req.params;


            const collectionName =
                allowedCollections[collection];


            if (!collectionName) {

                return res.status(400).json({
                    message: "Invalid collection",
                });

            }


            const Lead = mongoose.model(
                `Lead_${collection}`,
                leadSchema,
                collectionName
            );


            const leads = await Lead
                .find()
                .sort({
                    createdAt: -1,
                });


            res.json(leads);


        } catch (error) {

            console.error(
                "GET LEADS ERROR:",
                error
            );


            res.status(500).json({
                message: "Failed to fetch leads",
                error: error.message,
            });

        }

    }
);


// =====================================
// UPDATE LEAD STATUS
// =====================================

router.put(
    "/:collection/:id/status",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                collection,
                id,
            } = req.params;

            const {
                status,
            } = req.body;


            // Check collection

            const collectionName =
                allowedCollections[collection];


            if (!collectionName) {

                return res.status(400).json({
                    message: "Invalid collection",
                });

            }


            // Check status

            const allowedStatuses = [
                "New",
                "Interested",
                "Not Interested",
                "Closed",
            ];


            if (
                !allowedStatuses.includes(status)
            ) {

                return res.status(400).json({
                    message: "Invalid status",
                });

            }


            // Get collection model

            const Lead = mongoose.model(
                `Lead_${collection}`,
                leadSchema,
                collectionName
            );


            // Update

            const lead =
                await Lead.findByIdAndUpdate(
                    id,
                    {
                        status: status,
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );


            if (!lead) {

                return res.status(404).json({
                    message: "Lead not found",
                });

            }


            res.json({
                message: "Status updated successfully",
                lead: lead,
            });


        } catch (error) {

            console.error(
                "UPDATE STATUS ERROR:",
                error
            );


            res.status(500).json({
                message: "Failed to update status",
                error: error.message,
            });

        }

    }
);


// =====================================
// UPDATE COMPLETE LEAD
// =====================================

router.put(
    "/:collection/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                collection,
                id,
            } = req.params;


            const collectionName =
                allowedCollections[collection];


            if (!collectionName) {

                return res.status(400).json({
                    message: "Invalid collection",
                });

            }


            const Lead = mongoose.model(
                `Lead_${collection}`,
                leadSchema,
                collectionName
            );


            const {
                clientName,
                phone,
                rmName,
                project,
                notes,
                photo,
                status,
            } = req.body;


            const lead =
                await Lead.findByIdAndUpdate(
                    id,
                    {
                        clientName,
                        phone,
                        rmName,
                        project,
                        notes,
                        photo,
                        status,
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );


            if (!lead) {

                return res.status(404).json({
                    message: "Lead not found",
                });

            }


            res.json({
                message: "Lead updated successfully",
                lead: lead,
            });


        } catch (error) {

            console.error(
                "UPDATE LEAD ERROR:",
                error
            );


            res.status(500).json({
                message: "Failed to update lead",
                error: error.message,
            });

        }

    }
);


// =====================================
// DELETE LEAD
// =====================================

router.delete(
    "/:collection/:id",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                collection,
                id,
            } = req.params;


            const collectionName =
                allowedCollections[collection];


            if (!collectionName) {

                return res.status(400).json({
                    message: "Invalid collection",
                });

            }


            const Lead = mongoose.model(
                `Lead_${collection}`,
                leadSchema,
                collectionName
            );


            const lead =
                await Lead.findByIdAndDelete(id);


            if (!lead) {

                return res.status(404).json({
                    message: "Lead not found",
                });

            }


            res.json({
                message: "Lead deleted successfully",
                id: id,
            });


        } catch (error) {

            console.error(
                "DELETE LEAD ERROR:",
                error
            );


            res.status(500).json({
                message: "Failed to delete lead",
                error: error.message,
            });

        }

    }
);


module.exports = router;