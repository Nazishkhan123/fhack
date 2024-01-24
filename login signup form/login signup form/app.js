// Filename - App.js

const express = require("express"),
	mongoose = require("mongoose"),
	passport = require("passport"),
	bodyParser = require("body-parser"),
	LocalStrategy = require("passport-local"),
	passportLocalMongoose = 
		require("passport-local-mongoose")
const User = require("./model/user");
let app = express();

mongoose.connect('mongodb://127.0.0.1:27017/your-database-name', { useNewUrlParser: true, useUnifiedTopology: true });

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(require("express-session")({
	secret: "Rusty is a dog",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//=====================
// ROUTES
//=====================
app.use(express.static('public'));
// Showing home page
app.get("/", function (req, res) {
	res.render("home");
});

// Showing secret page
app.get("/secret", isLoggedIn, function (req, res) {
	res.render("secret");
});

// Showing register form
app.get("/register", function (req, res) {
	res.render("register");
});

// Handling user signup
app.post("/register", async (req, res) => {
	const user = await User.create({
	username: req.body.username,
	password: req.body.password
	});

	return res.status(200).json(user);
});

//Showing login form
app.get("/login", function (req, res) {
	res.render("login");
});

//Handling user login
app.post("/login", async function(req, res){
	try {
		// check if the user exists
		const user = await User.findOne({ username: req.body.username });
		if (user) {
		//check if password matches
		const result = req.body.password === user.password;
		if (result) {
			res.render("secret");
		} else {
			res.status(400).json({ error: "password doesn't match" });
		}
		} else {
		res.status(400).json({ error: "User doesn't exist" });
		}
	} catch (error) {
		res.status(400).json({ error });
	}
});

//Handling user logout 
app.get("/logout", function (req, res) {
	req.logout(function(err) {
		if (err) { return next(err); }
		res.redirect('/');
	});
});



function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) return next();
	res.redirect("/login");
}
// Create a project schema
const projectSchema = new mongoose.Schema({
	title: String,
	developer: String,
	description: String,
	hostedURL: String
  });
  
  const Project = mongoose.model('Project', projectSchema);
  
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.static('public'));
  
  // Serve the HTML file
  app.get('/', (req, res) => {
	res.sendFile(__dirname + '/public/index.html');
  });
  
  // Handle form submission
  app.post('/submit', async (req, res) => {
	try {
	  const newProject = new Project({
		title: req.body.title,
		developer: req.body.developer,
		description: req.body.description,
		hostedURL: req.body.hostedURL
	  });
  	  // Save to the database
	  await newProject.save();
  
	  // Send a success response
	  res.sendStatus(200);
	} catch (error) {
	  console.error(error);
	  res.sendStatus(500);
	}
  });
  
  // Retrieve all projects from the database
  app.get('/projects', async (req, res) => {
	try {
	  const projects = await Project.find({});
  
	  res.json(projects);
	} catch (error) {
	  console.error(error);
	  res.sendStatus(500);
	}
  });
  
  

let port = process.env.PORT || 3000;
app.listen(port, function () {
	console.log("Server Has Started!");
});


