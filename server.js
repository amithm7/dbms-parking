var express = require("express");
var session = require("express-session");
var mysql = require('mysql');

// Creating mysql connection
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'parker',
	password: 'parker',
	database: 'parkingTest'
});
connection.connect(function (err) {
	if (!err) {
		console.log("Database is connected ... \n\n");
	} else {
		console.log("Error connecting database ... \n\n");
		// throw err;
	}
});

var app = express();

// Start Server
app.listen(8888, function () {
	console.log("Started on PORT 8888: http://localhost:8888");
});

// To read post data from client
// - parse json encoded bodies
app.use(express.json());
// - parse application/x-www-form-urlencoded
app.use(express.urlencoded({
	extended: true
}));

// Secret key is a random string and visible for the project purpose
app.use(session({ secret: "nd89yer897e89rfhsdfbn", resave: false, saveUninitialized: true }));

// To serve static files in 'public' folder with '/static' endpoint
app.use('/static', express.static(__dirname + '/app/public'));

/* Routes */
// Home
app.get('/', function (req, res) {
	if (req.session.user) {
		res.redirect('/dashboard');
	} else {
		res.sendFile('login.html', { root: __dirname + '/app' });
	}
});

// Dashboard
app.get('/dashboard', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	} else {
		return res.status(200).sendFile('app.html', { root: __dirname + '/app' });
	}
});

/* API */
// Login
app.post('/api/login', function (req, res) {
	console.log(req.body);

	if (req.body.username == "admin" && req.body.password == "admin") {
		req.session.user = req.body.username;
		res.redirect('/dashboard');
	} else {
		res.redirect('back');	// Back 1 page
	}
});

// Logout
app.get('/api/logout', function (req, res) {
	req.session.destroy();
	res.redirect('/');
});
