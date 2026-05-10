const express = require("express");

const {
  createLead,
  getAllLeads,
  getMyLeads,
  updateLeadStatus,
  deleteLead,
} = require("../controllers/leadController");

const router = express.Router();


// CREATE
router.post("/", createLead);


// GET ALL
router.get("/", getAllLeads);


// GET MY
router.get("/my", getMyLeads);


// UPDATE STATUS
router.put("/:id/status", updateLeadStatus);


// DELETE
router.delete("/:id", deleteLead);


module.exports = router;