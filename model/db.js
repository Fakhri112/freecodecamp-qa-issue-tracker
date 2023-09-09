const mongoose = require("mongoose");
const { Schema, model } = mongoose;
mongoose.connect(process.env.DB);
const issueSchema = new Schema(
	{
		project_name: String,
		issue_title: {
			type: String,
			required: true,
		},
		issue_text: {
			type: String,
			required: true,
		},
		created_by: {
			type: String,
			required: true,
		},
		assigned_to: String,
		status_text: String,
		open: Boolean,
	},
	{
		timestamps: {
			createdAt: "created_on", // Use `created_at` to store the created date
			updatedAt: "updated_on", // and `updated_at` to store the last updated date
		},
	},
);

const FCissueDB = model("FCissueDB", issueSchema);

module.exports = { FCissueDB };
