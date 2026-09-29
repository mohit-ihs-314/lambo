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

    // OLD INVESTOR LEADS
    investor: "investor_leads",

    // LAMBO
    lambo: "lambo_leads",

    // LOFT
    loft: "loft_leads",

    // OMAXE
    omaxe: "omaxe_leads",

    // NEW IHS
    IHS_01_10_2026: "investor_leads_01_10_2026",
};


// =====================================
// GET COLLECTION MODEL
// =====================================

const getLeadModel = (collection) => {

    const collectionName =
        allowedCollections[collection];

    if (!collectionName) {
        return null;
    }

    return mongoose.model(
        `AdminLead_${collection}`,
        leadSchema,
        collectionName
    );
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
// GET LEADS
// =====================================

router.get(
    "/:collection",
    authMiddleware,
    async (req, res) => {

        try {

            const {
                collection,
            } = req.params;


            const Lead =
                getLeadModel(collection);


            if (!Lead) {

                return res.status(400).json({
                    message: "Invalid collection",
                });

            }


            console.log(
                "================================="
            );

            console.log(
                "ADMIN FETCH COLLECTION:",
                collection
            );

            console.log(
                "MONGODB COLLECTION:",
                Lead.collection.name
            );

            console.log(
                "================================="
            );


            const leads =
                await Lead
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
                message:
                    "Failed to fetch leads",

                error:
                    error.message,
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


            const Lead =
                getLeadModel(collection);


            if (!Lead) {

                return res.status(400).json({
                    message:
                        "Invalid collection",
                });

            }


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
                    message:
                        "Invalid status",
                });

            }


            const lead =
                await Lead.findByIdAndUpdate(
                    id,
                    {
                        status,
                    },
                    {
                        new: true,
                        runValidators: true,
                    }
                );


            if (!lead) {

                return res.status(404).json({
                    message:
                        "Lead not found",
                });

            }


            res.json({
                message:
                    "Status updated successfully",

                lead,
            });


        } catch (error) {

            console.error(
                "UPDATE STATUS ERROR:",
                error
            );


            res.status(500).json({
                message:
                    "Failed to update status",

                error:
                    error.message,
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


            const Lead =
                getLeadModel(collection);


            if (!Lead) {

                return res.status(400).json({
                    message:
                        "Invalid collection",
                });

            }


            const {
                clientName,
                phone,
                rmName,
                project,
                notes,
                photo,
                status,
            } = req.body;


            const updateData = {
                clientName,
                phone,
                status,
                notes,
            };


            // Don't add unnecessary IHS fields
            if (
                collection !==
                "IHS_01_10_2026"
            ) {

                updateData.rmName =
                    rmName || "";

                updateData.project =
                    project || "";

                updateData.photo =
                    photo || "";

            }


            const lead =
                await Lead.findByIdAndUpdate(
                    id,
                    updateData,
                    {
                        new: true,
                        runValidators: true,
                    }
                );


            if (!lead) {

                return res.status(404).json({
                    message:
                        "Lead not found",
                });

            }


            res.json({
                message:
                    "Lead updated successfully",

                lead,
            });


        } catch (error) {

            console.error(
                "UPDATE LEAD ERROR:",
                error
            );


            res.status(500).json({
                message:
                    "Failed to update lead",

                error:
                    error.message,
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


            const Lead =
                getLeadModel(collection);


            if (!Lead) {

                return res.status(400).json({
                    message:
                        "Invalid collection",
                });

            }


            const lead =
                await Lead.findByIdAndDelete(id);


            if (!lead) {

                return res.status(404).json({
                    message:
                        "Lead not found",
                });

            }


            res.json({
                message:
                    "Lead deleted successfully",

                id,
            });


        } catch (error) {

            console.error(
                "DELETE LEAD ERROR:",
                error
            );


            res.status(500).json({
                message:
                    "Failed to delete lead",

                error:
                    error.message,
            });

        }

    }
);


module.exports = router;