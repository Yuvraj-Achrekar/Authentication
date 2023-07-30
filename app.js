//jshint esversion:6
import express from "express";
import mongoose from "mongoose";

mongoose.connect("mongodb://localhost:27017/userDB");
const app = express();

const userSchema = new mongoose.Schema({
	email: String,
	password: String,
});

const User = mongoose.model("User", userSchema);

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/", function (req, res) {
	res.render("home");
});
app.get("/register", function (req, res) {
	res.render("register");
});
app.get("/login", function (req, res) {
	res.render("login");
});

app.post("/register", function (req, res) {
	const user = new User({
		email: req.body.username,
		password: req.body.password,
	});

	user
		.save()
		.then(() => {
			res.render("secrets");
		})
		.catch((err) => {
			console.log(err);
		});
});

app.post("/login", function (req, res) {
	const username = req.body.username;
	const password = req.body.password;

	User.findOne({ email: username })
		.then((foundUser) => {
			if (foundUser) {
				if (foundUser.password === password) {
					res.render("secrets");
				} else {
					res.send("Incorrect Password");
				}
			} else {
				res.send("No User Exist");
			}
		})
		.catch((err) => {
			console.log(err);
		});
});

app.listen(3000, function () {
	console.log("Server running on port 3000");
});
