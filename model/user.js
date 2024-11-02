const { Schema, model } = require("mongoose");

const User = new Schema(
  {
    chat_id: Number,
    action: String,
    name: Number,
    phone_number: String,
    language: String,
  },
  { timestamps: true, collection: "users" }
);

module.exports = model("User", User);
