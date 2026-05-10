const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Lead", leadSchema);