var express = require("express");
var session = require("express-session");
var mysql = require('mysql');

// Creating mysql connection
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'parkingAPI',
	password: 'password',
	database: 'parkingMS',
	multipleStatements: true,
	timezone: 'utc'
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

// Vehicle Entry
app.post('/api/vehicleEntry', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	}

	// Check if this customer or vehicle exists in the DB
	var customerExists = "SELECT COUNT(*) FROM CUSTOMER WHERE PHONE = \"" + req.body.phone + "\";";
	var vehicleExists = "SELECT COUNT(*) FROM VEHICLE WHERE REGISTRATION = \"" + req.body.registration + "\";";
	connection.query(customerExists + vehicleExists, function (err, result) {
		if (err) {
			return res.sendStatus(500);
		}

		// If customer record not found in the DB, add it
		if (result[0][0]['COUNT(*)'] == 0) {
			var newCustomerSQL = "INSERT INTO CUSTOMER VALUES ('" +
				req.body.cusFName + "', '" +
				req.body.cusLName + "', " +
				req.body.phone + ");";
			connection.query(newCustomerSQL, function (err, result) {
				if (err) {
					console.log(err);
					return res.sendStatus(500);
				}
				console.log("New customer added");
			});
		}

		// If Vehicle record not found in the DB, add it
		if (result[1][0]['COUNT(*)'] == 0) {
			var newVehicleSQL = "INSERT INTO VEHICLE VALUES (\"" +
				req.body.registration + "\", \"" +
				req.body.brand + "\", \"" +
				req.body.model + "\", \"" +
				req.body.color + "\", " +
				req.body.type + ", " +
				req.body.phone + ")";
			connection.query(newVehicleSQL, function (err, result) {
				if (err) {
					console.log(err);
					return res.sendStatus(500);
				}
				console.log("New vehicle added");
			});
		}

		// Query available parking slots
		connection.query("SELECT * FROM `PARKING_SPACE` WHERE `SLOT_STATUS` = 'AV'", function (err, result) {
			if (err) {
				return res.sendStatus(500);
			}

			// If a parking slot is available, generate a new token and occupy a parking slot
			if (result[0]) {
				var parkingArea = result[0].AREA;
				var parkingSlot = result[0].SLOT_NUMBER;
				var entryTime = new Date().toISOString().slice(0, 19).replace('T', ' ');
				var billAmount = 20; // base charge

				var newTokenSQL = "INSERT INTO TOKEN (ENTRY_TIME, BILL_AMOUNT, VEHICLE_REG, PARKING_AREA, PARKING_SLOT) VALUES(\"" +
					entryTime + "\", " +
					billAmount + ", \"" +
					req.body.registration + "\", \"" +
					parkingArea + "\", " +
					parkingSlot + ");";

				var occupyParkingSlotSQL = "UPDATE `PARKING_SPACE` SET `SLOT_STATUS` = 'OC' WHERE `AREA` = '" +
					parkingArea + "' AND `SLOT_NUMBER` = " +
					parkingSlot + ";";

				connection.query(newTokenSQL + occupyParkingSlotSQL, function (err, result) {
					if (err) {
						console.log(err);
						return res.sendStatus(500);
					}
					console.log("token number " + result[0].insertId + " generated for " + req.body.registration + " and parked at " + parkingArea + parkingSlot);
					res.status(200).json({number: result[0].insertId, area: parkingArea, slot: parkingSlot});
				});
			} else {
				return res.status(500).send("Parking Full!");
			}
		});
	});
});

// View Vehicles
app.get('/api/viewParkedVehicles', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	}

	var viewParkedVehiclesSQL = "SELECT `NUMBER`, `ENTRY_TIME`, `VEHICLE_REG`, `PARKING_AREA`, `PARKING_SLOT` FROM `TOKEN` WHERE `EXIT_TIME` IS NULL ORDER BY `NUMBER`";
	connection.query(viewParkedVehiclesSQL, function (err, result) {
		if (err) {
			console.log("Error retrieving parked vehicles: " + err.sqlMessage);
			return res.sendStatus(500);
		}
		res.status(200).json(result);
	});
});

// Vehicle Exit
app.post('/api/vehicleExit', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	}

	// Query parking slot to be cleared
	connection.query("SELECT `PARKING_AREA`, `PARKING_SLOT` FROM `TOKEN` WHERE `NUMBER` = ?", req.body.token, function (err, result) {
		if (err) {
			return res.sendStatus(500);
		}

		var parkingArea = result[0].PARKING_AREA;
		var parkingSlot = result[0].PARKING_SLOT;
		var exitTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

		var exitTokenUpdateSQL = "UPDATE `TOKEN` SET `EXIT_TIME` = '" +
			exitTime + "' WHERE `NUMBER` = " + req.body.token + ";";

		var clearParkingSlotSQL = "UPDATE `PARKING_SPACE` SET `SLOT_STATUS` = 'AV' WHERE `AREA` = '" +
			parkingArea + "' AND `SLOT_NUMBER` = " +
			parkingSlot + ";";

		var getBillAmountSQL = "SELECT `BILL_AMOUNT` FROM `TOKEN` WHERE `NUMBER` = " + req.body.token + ";";

		connection.query(exitTokenUpdateSQL + clearParkingSlotSQL + getBillAmountSQL, function (err, result) {
			if (err) {
				console.log("Error exiting vehicle: " + err.sqlMessage);
				return res.sendStatus(500);
			}
			res.status(200).json({ 'billAmount': result[2][0].BILL_AMOUNT });
		});
	});
});

// Stats - Parking Space Status
app.get('/api/viewParkingSpace', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	}

	connection.query("SELECT * FROM `PARKING_SPACE` ORDER BY `SLOT_STATUS`, `AREA`, `SLOT_NUMBER`", function (err, result) {
		if (err) {
			return res.sendStatus(500);
		}
		res.status(200).json(result);
	});
});

// Manage - Employee Addition
app.post('/api/empAdd', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	}

	var newEmployeeSQL = "INSERT INTO EMPLOYEE VALUES (" +
		req.body.ssn + ", '" +
		req.body.firstName + "', '" +
		req.body.lastName + "', '" +
		req.body.sex + "', " +
		req.body.phone + ");";
	connection.query(newEmployeeSQL, function (err, result) {
		if (err) {
			console.log("Error adding employee: " + err.sqlMessage);
			return res.sendStatus(500);
		}
		console.log("employee added");
		res.sendStatus(200);
	});
});

// Manage - Get employee list
app.get('/api/getEmployeeList', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	}

	var getEmployeeListSQL = "SELECT `SSN`, `FIRST_NAME`, `LAST_NAME` FROM `EMPLOYEE` ORDER BY `SSN`";
	connection.query(getEmployeeListSQL, function (err, result) {
		if (err) {
			console.log("Error getting employee list : " + err.sqlMessage);
			return res.sendStatus(500);
		}
		return res.status(200).json(result);
	});
});

// Manage - Parking Space Addition
app.post('/api/parkingSpaceAdd', function (req, res) {
	if (!req.session.user) {
		return res.status(401).send('Unauthorized');
	}

	var parkingSpaceSQL = "";
	for (var i = 1; i <= req.body.slots; i++) {
		parkingSpaceSQL += "INSERT INTO `PARKING_SPACE` VALUES ('" +
			req.body.area + "', " + i + ", 'AV', " +
			req.body.ssn + ");";
	}
	connection.query(parkingSpaceSQL, function (err, result) {
		if (err) {
			console.log("Error adding parking slot " + req.body.area + " : " + err.sqlMessage);
			return res.sendStatus(500);
		}
		return res.sendStatus(200);
	});
});
