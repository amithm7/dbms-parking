// Navigation
document.querySelectorAll('.sidenav__btn').forEach(function (ele) {
	ele.addEventListener('click', function () {
		// Change sidenav active color
		document.querySelector('.sidenav__btn--active').classList.remove('sidenav__btn--active');
		this.classList.add('sidenav__btn--active');

		// Deactivate previous section
		document.querySelector('.content--active').classList.remove('content--active');

		// Activate new section
		function switchSection(className) {
			document.querySelector('.content__' + className).classList.add('content--active');
		}
		switch (this.name) {
			case 'vehicleEntry': switchSection('vehicleEntry'); break;
			case 'vehicleExit': switchSection('vehicleExit'); break;
			case 'stats': switchSection('stats'); break;
			case 'manage': switchSection('manage'); break;
		}
	});
});

// Vehicle Entry Form submission
document.querySelector('.vehicleEntryForm button').addEventListener('click', function() {
	var vehicleData = {};
	var form = document.querySelector('.vehicleEntryForm');
	vehicleData.registration = form.querySelector('[name="registration_1"]').value +
		form.querySelector('[name="registration_2"]').value +
		form.querySelector('[name="registration_3"]').value;
	vehicleData.brand = form.querySelector('[name="brand"]').value;
	vehicleData.model = form.querySelector('[name="model"]').value;
	vehicleData.color = form.querySelector('[name="color"]').value;
	vehicleData.type = form.querySelector('[name="type"]:checked').value;

	xhr = new XMLHttpRequest();
	xhr.open("POST", "api/vehicleEntry");
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(JSON.stringify(vehicleData));
});

// Employee Form submission
document.querySelector('.employeeForm button').addEventListener('click', function() {
	var employee = {};
	var form = document.querySelector('.employeeForm');
	employee.ssn = form.querySelector('[name="ssn"]').value;
	employee.firstName = form.querySelector('[name="firstName"]').value;
	employee.lastName = form.querySelector('[name="lastName"]').value;
	employee.sex = form.querySelector('[name="sex"]:checked').value;
	employee.phone = form.querySelector('[name="phone"]').value;

	xhr = new XMLHttpRequest();
	xhr.open("POST", "api/empAdd");
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(JSON.stringify(employee));
});

// Parking Space Form submission
document.querySelector('.parkingSpaceForm button').addEventListener('click', function() {
	var parkingSpace = {};
	var form = document.querySelector('.parkingSpaceForm');
	parkingSpace.area = form.querySelector('[name="area"]').value;
	parkingSpace.slots = form.querySelector('[name="slots"]').value;
	parkingSpace.ssn = form.querySelector('[name="ssn"]').value;

	xhr = new XMLHttpRequest();
	xhr.open("POST", "api/parkingSpaceAdd");
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(JSON.stringify(parkingSpace));
});

// View currently parked vehicles
document.querySelector('.sidenav__btn[name="vehicleExit"]').addEventListener('click', function() {
	xhr = new XMLHttpRequest();
	xhr.open("GET", "api/viewParkedVehicles", true);
	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			var parkedVehicles = JSON.parse(this.responseText);
			var tableHTML = "<table>";
			tableHTML += "<tr>";
			for (var i in Object.keys(parkedVehicles[0])) {
				tableHTML += "<th>" + Object.keys(parkedVehicles[0])[i] + "</th>";
			}
			tableHTML += "<th>Exit</th></tr>";
			for (i in parkedVehicles) {
				tableHTML += "<tr value=" + parkedVehicles[i].NUMBER + ">";
				for (var key in parkedVehicles[i]) {
					tableHTML += "<td>" + parkedVehicles[i][key] + "</td>";
				}
				tableHTML += "<td><button value="+ parkedVehicles[i].NUMBER + ">Exit</button></td></tr>";
			}
			tableHTML += "</table>";
			document.querySelector('.viewVehicles').innerHTML = tableHTML;

			// Vehicle Exit
			document.querySelectorAll('.viewVehicles table tr button').forEach(function (token) {
				token.addEventListener('click', function () {
					xhr = new XMLHttpRequest();
					xhr.open("POST", "api/vehicleExit");
					xhr.setRequestHeader("Content-type", "application/json");
					xhr.onreadystatechange = function () {
						if (this.readyState == 4 && this.status == 200) {
							document.querySelector('.viewVehicles table tr[value = "' + token.value + '" ]').innerHTML = "";
							alert("Bill generated for Rs. " + JSON.parse(this.responseText).billAmount);
						}
					};
					xhr.send(JSON.stringify({ 'token': token.value }));
				});
			});
		}
	};
	xhr.send();
});
