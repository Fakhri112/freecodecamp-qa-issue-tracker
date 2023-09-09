"use strict";

const res = require("express/lib/response");
const { FCissueDB } = require("../model/db");

module.exports = function (app) {
	app
		.route("/api/issues/:project")
		.get(async function (req, res) {
			let project = req.params.project;
			let query = req.query;
			if (Object.keys(query).length === 0) {
				let response = await FCissueDB.find({ project_name: project })
					.select("-project_name -__v")
					.exec();
				return res.json(response);
			}
			let response = await FCissueDB.find({ project_name: project, ...query })
				.select("-project_name -__v")
				.exec();
			return res.json(response);
		})

		.post(async function (req, res) {
			let project = req.params.project;
			console.log(req.body.status_text);
			if (
				!req.body.issue_title ||
				!req.body.issue_text ||
				!req.body.created_by
			) {
				return res.json({ error: "required field(s) missing" });
			}
			const payload = {
				project_name: project,
				issue_title: req.body.issue_title,
				issue_text: req.body.issue_text,
				created_by: !req.body.created_by ? "" : req.body.created_by,
				assigned_to: !req.body.assigned_to ? "" : req.body.assigned_to,
				status_text: !req.body.status_text ? "" : req.body.status_text,
				open: true,
			};
			const data = new FCissueDB(payload);
			let response = (await data.save()).toJSON();
			const { __v, project_name, ...responseData } = response;
			return res.json({ ...responseData });
		})

		.put(async function (req, res) {
			let project = req.params.project;
			let issue_id = req.body._id;
			for (const key in req.body) {
				if (!req.body[key] || key == "_id") {
					delete req.body[key];
				}
			}
			if (!issue_id) return res.json({ error: "missing _id" });
			if (Object.keys(req.body).length === 0)
				return res.json({ error: "no update field(s) sent", _id: issue_id });
			try {
				const data = await FCissueDB.findById(issue_id);
				if (!data)
					return res.json({ error: "could not update", _id: issue_id });
				await FCissueDB.updateOne(
					{
						_id: issue_id,
						project_name: project,
					},
					req.body,
				);
				return res.json({ result: "successfully updated", _id: issue_id });
			} catch (error) {
				return res.json({ error: "could not update", _id: issue_id });
			}
		})

		.delete(async function (req, res) {
			let project = req.params.project;
			let issue_id = req.body._id;
			try {
				if (!issue_id) return res.json({ error: "missing _id" });
				const data = await FCissueDB.findById(issue_id);
				if (!data)
					return res.json({ error: "could not delete", _id: issue_id });
				await FCissueDB.deleteOne({ _id: issue_id, project_name: project });
				return res.json({ result: "successfully deleted", _id: issue_id });
			} catch (error) {
				return res.json({ error: "could not delete", _id: issue_id });
			}
		});
};
