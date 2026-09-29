const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const authMiddleware =
    require("../middleware/authMiddleware");

const {
    syncLeadToGoogleSheet,
} = require("../utils/googleSheet");


// =====================================================
// LEAD SCHEMA
// =====================================================

const leadSchema =
    new mongoose.Schema(
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


// =====================================================
// COLLECTION MAPPING
// =====================================================

const allowedCollections = {

    // OLD INVESTOR
    investor:
        "investor_leads",

    // LAMBO
    lambo:
        "lambo_leads",

    // LOFT
    loft:
        "loft_leads",

    // OMAXE
    omaxe:
        "omaxe_leads",

    // NEW IHS
    IHS_01_10_2026:
        "investor_leads_01_10_2026",
};


// =====================================================
// GET MODEL
// =====================================================

const getLeadModel = (
    collection
) => {

    const collectionName =
        allowedCollections[
            collection
        ];

    if (!collectionName) {
        return null;
    }

    return mongoose.model(
        `AdminLead_${collection}`,
        leadSchema,
        collectionName
    );
};


// =====================================================
// AUTOMATIC IHS → GOOGLE SHEET SYNC
// =====================================================
//
// This watches MongoDB directly.
//
// It means:
// Flutter / another backend
//        ↓
// MongoDB
//        ↓
// MongoDB Change Stream
//        ↓
// Google Sheet
//
// Admin Panel does NOT need to be refreshed.
// =====================================================

const startIhsGoogleSheetWatcher = () => {

    try {

        const IHSLead =
            getLeadModel(
                "IHS_01_10_2026"
            );

        if (!IHSLead) {

            console.error(
                "IHS MODEL NOT FOUND"
            );

            return;
        }


        console.log(
            "Starting IHS Google Sheet watcher..."
        );


        const changeStream =
            IHSLead.watch(
                [],
                {
                    fullDocument:
                        "updateLookup",
                }
            );


        changeStream.on(
            "change",
            async (change) => {

                try {

                    console.log(
                        "IHS MONGODB CHANGE:",
                        change.operationType
                    );


                    // =====================================
                    // NEW LEAD
                    // =====================================

                    if (
                        change.operationType ===
                        "insert"
                    ) {

                        const lead =
                            change.fullDocument;

                        console.log(
                            "NEW IHS LEAD DETECTED:",
                            lead?._id?.toString()
                        );


                        await syncLeadToGoogleSheet({

                            action:
                                "upsert",

                            lead,
                        });


                        console.log(
                            "NEW IHS LEAD SYNCED TO GOOGLE SHEET"
                        );
                    }


                    // =====================================
                    // UPDATED LEAD
                    // =====================================

                    else if (
                        change.operationType ===
                        "update" ||
                        change.operationType ===
                        "replace"
                    ) {

                        const lead =
                            change.fullDocument;

                        if (!lead) {

                            console.log(
                                "Updated IHS lead has no fullDocument"
                            );

                            return;
                        }


                        console.log(
                            "IHS LEAD UPDATED:",
                            lead._id?.toString()
                        );


                        await syncLeadToGoogleSheet({

                            action:
                                "upsert",

                            lead,
                        });


                        console.log(
                            "UPDATED IHS LEAD SYNCED TO GOOGLE SHEET"
                        );
                    }


                    // =====================================
                    // DELETED LEAD
                    // =====================================

                    else if (
                        change.operationType ===
                        "delete"
                    ) {

                        const leadId =
                            change.documentKey
                                ?._id;


                        console.log(
                            "IHS LEAD DELETED:",
                            leadId?.toString()
                        );


                        await syncLeadToGoogleSheet({

                            action:
                                "delete",

                            lead: {
                                _id:
                                    leadId,
                            },
                        });


                        console.log(
                            "DELETED IHS LEAD REMOVED FROM GOOGLE SHEET"
                        );
                    }


                } catch (error) {

                    console.error(
                        "IHS GOOGLE SHEET WATCHER ERROR:",
                        error.message
                    );
                }
            }
        );


        changeStream.on(
            "error",
            (error) => {

                console.error(
                    "IHS CHANGE STREAM ERROR:",
                    error
                );

            }
        );


        changeStream.on(
            "close",
            () => {

                console.log(
                    "IHS CHANGE STREAM CLOSED"
                );

            }
        );


        console.log(
            "IHS Google Sheet watcher started successfully"
        );


    } catch (error) {

        console.error(
            "FAILED TO START IHS GOOGLE SHEET WATCHER:",
            error
        );
    }
};


// =====================================================
// START WATCHER AFTER MONGODB CONNECTION
// =====================================================

if (
    mongoose.connection.readyState === 1
) {

    startIhsGoogleSheetWatcher();

} else {

    mongoose.connection.once(
        "connected",
        () => {

            startIhsGoogleSheetWatcher();

        }
    );
}


// =====================================================
// TEST
// =====================================================

router.get(
    "/",
    (req, res) => {

        res.json({

            message:
                "Lead API is working",

            availableCollections:
                Object.keys(
                    allowedCollections
                ),
        });
    }
);


// =====================================================
// GET LEADS
// =====================================================

router.get(
    "/:collection",
    authMiddleware,

    async (req, res) => {

        try {

            const {
                collection,
            } = req.params;


            const Lead =
                getLeadModel(
                    collection
                );


            if (!Lead) {

                return res.status(400).json({

                    message:
                        "Invalid collection",
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


// =====================================================
// UPDATE STATUS
// =====================================================

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
                getLeadModel(
                    collection
                );


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
                !allowedStatuses.includes(
                    status
                )
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


// =====================================================
// UPDATE COMPLETE LEAD
// =====================================================

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
                getLeadModel(
                    collection
                );


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

                notes:
                    notes || "",
            };


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


// =====================================================
// DELETE LEAD
// =====================================================

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
                getLeadModel(
                    collection
                );


            if (!Lead) {

                return res.status(400).json({

                    message:
                        "Invalid collection",
                });
            }


            const lead =
                await Lead.findById(id);


            if (!lead) {

                return res.status(404).json({

                    message:
                        "Lead not found",
                });
            }


            await lead.deleteOne();


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