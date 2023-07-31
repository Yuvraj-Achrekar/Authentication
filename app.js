import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import md5 from "md5";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

const saltRounds = 10;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
	session({
		secret: "This is our secret",
		resave: false,
		saveUninitialized: false,
	})
);
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB");

const userSchema = new mongoose.Schema({
	username: String,
	password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
	res.render("home");
});
app.get("/register", function (req, res) {
	res.render("register");
});
app.get("/login", function (req, res) {
	res.render("login");
});

app.get("/secrets", function (req, res) {
	if (req.isAuthenticated()) {
		res.render("secrets");
	} else {
		res.render("login");
	}
});

app.post("/register", function (req, res) {
	User.register(
		{ username: req.body.username },
		req.body.password,
		function (err, result) {
			if (!err) {
				passport.authenticate("local")(req, res, function () {
					res.redirect("/secrets");
				});
			}
		}
	);
});

app.post("/login", function (req, res) {
	const user = new User({
		username: req.body.username,
		password: req.body.password,
	});

	req.login(user, function (err) {
		if (err) {
			console.log(err);
		} else {
			passport.authenticate("local")(req, res, function () {
				res.redirect("/secrets");
			});
		}
	});
});

app.get("/logout", function (req, res) {
	req.logout(function (err) {
		if (err) {
			return next(err);
		} else {
			res.redirect("/");
		}
	});
});

app.listen(3000, function () {
	console.log("Server running on port 3000");
});
