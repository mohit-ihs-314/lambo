const Lead = require("../models/Lead");


// CREATE LEAD
exports.createLead = async (req, res) => {
  try {
    const lead = await Lead.create({
      clientName: req.body.clientName,
      phone: req.body.phone,
      status: req.body.status || "New",
      photo: req.body.photo,
    });

    res.status(201).json(lead);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// GET ALL LEADS
exports.getAllLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({
      createdAt: -1,
    });

    res.json(leads);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// GET MY LEADS
exports.getMyLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({
      createdAt: -1,
    });

    res.json(leads);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// UPDATE STATUS
exports.updateLeadStatus = async (req, res) => {
  try {

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    lead.status = req.body.status;

    await lead.save();

    res.json({
      message: "Status updated",
      lead,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};


// DELETE LEAD
exports.deleteLead = async (req, res) => {
  try {

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        message: "Lead not found",
      });
    }

    await lead.deleteOne();

    res.json({
      message: "Lead deleted successfully",
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: error.message,
    });
  }
};