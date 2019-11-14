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

	// Test mysql connection - logs logout times
	var logoutTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
	connection.query("INSERT INTO LOGOUT VALUES (\"" + logoutTime + "\")", function (err, result) {
		if (err) throw err;
		console.log("app logout at " + logoutTime + " UTC");
	});

	req.session.destroy();
	res.redirect('/');
});

// Vehicle Entry
app.post('/api/vehicleEntry', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	}

	console.log(req.body);

	var newVehicle = "INSERT INTO VEHICLE VALUES (" + 
		req.body.registration + ", " +
		req.body.brand + ", " +
		req.body.model + ", " +
		req.body.color + ", " +
		req.body.type + ")";

	// Generate Token and note entry time
	var entryTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
	var billAmount = 20; // base charge

	// TODO - Update Vehicle Table if it already doesn't exist
	connection.query(newVehicle, function (err, result) {
		if (err) res.sendStatus(500);
		console.log("vehicle added");
		
		// Query and allot a slot for token

		// When all tables are updated
		res.sendStatus(200);
	});	
});

// Vehicle Exit
app.post('/api/vehicleExit', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	}

	console.log(req.body);
	
	var tokenNo = req.body.tokenNo;
	var exitTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

	// Calculate bill amount
	var billAmount;

	// If bill is generated
	res.status(200).send(billAmount);
	// if Server Error?
	res.sendStatus(500);
});

// Stats - 

// Manage - Employee Addition
app.post('/api/empAdd', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	}

	var newEmployee = "INSERT INTO EMPLOYEE VALUES (" +
		req.body.ssn + ", " +
		req.body.firstName + ", " +
		req.body.lastName + ", " +
		req.body.sex + ", " +
		req.body.phone + ")";

	connection.query(newEmployee, function (err, result) {
		if (err) res.sendStatus(500);
		console.log("employee added");
		res.sendStatus(200);
	});
});

// Manage - Employee Deletion
app.post('/api/empDel', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	}

	// Delete employee from the table

	// If success
	res.sendStatus(200);
	// if Server Error?
	res.sendStatus(500);
});
