import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import md5 from "md5";
import bcrypt from "bcrypt";

const saltRounds = 10;

mongoose.connect("mongodb://localhost:27017/userDB");
const app = express();

const userSchema = new mongoose.Schema({
	email: String,
	password: String,
});

//  database encryption method
// userSchema.plugin(encrypt, {
// 	secret: process.env.SECRET,
// 	encryptedFields: ["password"],
// });

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
	bcrypt.hash(req.body.password, saltRounds, function (err, hash) {
		// Store hash in your password DB.
		const user = new User({
			email: req.body.username,
			password: hash,
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
});

app.post("/login", function (req, res) {
	const username = req.body.username;
	const password = req.body.password;

	User.findOne({ email: username })
		.then((foundUser) => {
			if (foundUser) {
				bcrypt.compare(password, foundUser.password, function (err, result) {
					if (result === true) {
						res.render("secrets");
					} else {
						res.send("Incorrect Password");
					}
				});
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
