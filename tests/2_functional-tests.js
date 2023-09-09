const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

suite("Functional Tests", function () {
	let _id;
	test("Create an issue with every field: POST request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.post("/api/issues/movie")
			.send({
				issue_title: "Boogeyman",
				issue_text: "An Horror Movie",
				created_by: "Harrington",
				assigned_to: "Howard",
				status_text: "In Writing",
				open: true,
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.issue_title, "Boogeyman");
				assert.equal(res.body.issue_text, "An Horror Movie");
				assert.equal(res.body.created_by, "Harrington");
				assert.equal(res.body.assigned_to, "Howard");
				assert.equal(res.body.status_text, "In Writing");
				assert.equal(res.body.open, true);
				assert.isOk(res.body._id);
				_id = res.body._id;
				done();
			});
		//done();
	});
	test("Create an issue with only required fields: POST request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.post("/api/issues/movie")
			.send({
				issue_title: "Boogeyman 2",
				issue_text: "An Horror Movie",
				created_by: "Harry",
				open: true,
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.issue_title, "Boogeyman 2");
				assert.equal(res.body.issue_text, "An Horror Movie");
				assert.equal(res.body.created_by, "Harry");
				assert.equal(res.body.assigned_to, "");
				assert.equal(res.body.status_text, "");
				assert.equal(res.body.open, true);
				assert.isOk(res.body._id);
				done();
			});
		//done();
	});
	test("Create an issue with missing required fields: POST request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.post("/api/issues/movie")
			.send({
				assigned_to: "Howard",
				status_text: "In Writing",
				open: true,
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.error, "required field(s) missing");
				done();
			});
		//done();
	});
	test("View issues on a project: GET request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.get("/api/issues/movie")
			.end(function (err, res) {
				assert.equal(res.status, 200);
				for (let index = 0; index < res.body.length; index++) {
					assert.property(res.body[index], "issue_title");
					assert.property(res.body[index], "issue_text");
					assert.property(res.body[index], "created_by");
					assert.property(res.body[index], "assigned_to");
					assert.property(res.body[index], "status_text");
					assert.property(res.body[index], "open");
					assert.property(res.body[index], "_id");
				}

				done();
			});
	});
	test("View issues on a project with one filter: GET request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.get("/api/issues/movie?created_by=Harry")
			.end(function (err, res) {
				assert.equal(res.status, 200);
				for (let index = 0; index < res.body.length; index++) {
					assert.equal(res.body[index].created_by, "Harry");
				}
				done();
			});
	});
	test("View issues on a project with multiple filters: GET request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.get("/api/issues/movie?created_by=Harry&open=true")
			.end(function (err, res) {
				assert.equal(res.status, 200);
				for (let index = 0; index < res.body.length; index++) {
					assert.equal(res.body[index].created_by, "Harry");
					assert.equal(res.body[index].open, true);
				}
				done();
			});
	});

	test("Update one field on an issue: PUT request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.put("/api/issues/movie")
			.send({
				_id,
				status_text: "Production",
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.result, "successfully updated");
				assert.equal(res.body._id, _id);
				done();
			});
		//done();
	});

	test("Update multiple fields on an issue: PUT request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.put("/api/issues/movie")
			.send({
				_id,
				issue_title: "The Boogeyman",
				status_text: "Production",
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.result, "successfully updated");
				assert.equal(res.body._id, _id);
				done();
			});
		//done();
	});

	test("Update an issue with missing _id: PUT request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.put("/api/issues/movie")
			.send({
				issue_title: "The Boogeyman",
				status_text: "Production",
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.error, "missing _id");
				done();
			});
		//done();
	});

	test("Update an issue with no fields to update: PUT request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.put("/api/issues/movie")
			.send({
				_id,
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.error, "no update field(s) sent");
				done();
			});
		//done();
	});
	test("Update an issue with an invalid _id: PUT request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.put("/api/issues/movie")
			.send({
				_id: _id.slice(0, 20),
				issue_title: "The Boogeyman",
				status_text: "Production",
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.error, "could not update");
				done();
			});
		//done();
	});
	test("Delete an issue: DELETE request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.delete("/api/issues/movie")
			.send({
				_id,
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.result, "successfully deleted");
				assert.equal(res.body._id, _id);
				done();
			});
		//done();
	});
	test("Delete an issue with an invalid _id: DELETE request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.delete("/api/issues/movie")
			.send({
				_id: _id.slice(0, 20),
			})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.error, "could not delete");
				done();
			});
		//done();
	});
	test("Delete an issue with missing _id: DELETE request to /api/issues/{project}", function (done) {
		chai
			.request(server)
			.delete("/api/issues/movie")
			.send({})
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.equal(res.body.error, "missing _id");
				done();
			});
		//done();
	});
	//
	//
	//
	//
	//
	//
});
