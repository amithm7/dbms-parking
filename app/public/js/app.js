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

// Form "sending" message
function showFormSendingMsg(form) {
	var activeResponseHTML = form.querySelector('.form__response .res--active');
	if (activeResponseHTML) {
		activeResponseHTML.classList.remove('res--active');
	}
	form.querySelector('.form__response .res__loading').classList.add('res--active');
}

// Form submission response message
function showFormResponseMsg(xhr, form, msg) {
	if (xhr.readyState == 4) {
		var activeResponseHTML = form.querySelector('.form__response .res--active');
		if (xhr.status == 200) {
			if (activeResponseHTML) {
				activeResponseHTML.classList.remove('res--active');
			}
			var successResponseHTML = form.querySelector('.form__response .res__success');
			successResponseHTML.classList.add('res--active');
			successResponseHTML.querySelector('.res__msg').innerHTML = msg;
		} else {
			if (activeResponseHTML) {
				activeResponseHTML.classList.remove('res--active');
			}
			var failResponseHTML = form.querySelector('.form__response .res__fail');
			failResponseHTML.classList.add('res--active');
			failResponseHTML.querySelector('.res__msg').innerHTML = msg;
		}
	}
}

// Toggle display of manage forms
document.querySelectorAll('.content__manage .nav .showForm').forEach(function (ele) {
	ele.addEventListener('click', function () {
		// Deactivate previous form
		document.querySelector('.content__manage .form--active').classList.remove('form--active');

		// Activate new form
		switch (this.name) {
			case 'showEmployeeForm':
				document.querySelector('.content__manage .employeeForm').classList.add('form--active');
				break;
			case 'showParkingSpaceForm':
				document.querySelector('.content__manage .parkingSpaceForm').classList.add('form--active');
				var formInputLoadingMsgHTML = document.querySelector('.parkingSpaceForm .formInput__loading');
				xhr = new XMLHttpRequest();
				xhr.open("GET", "api/getEmployeeList", true);
				xhr.onreadystatechange = function () {
					if (this.readyState == 4) {
						if (this.status == 200) {
							var employeeList = JSON.parse(this.responseText);
							var optionsHTML = "";
							for (var i in employeeList) {
								optionsHTML += "<option value = " + employeeList[i].SSN + ">" +
									employeeList[i].FIRST_NAME + " " + employeeList[i].LAST_NAME +
									" (" + employeeList[i].SSN + ") " + "</option>";
							}
							// Remove loading message before showing employee list
							formInputLoadingMsgHTML.classList.remove('formInput__loading--active');
							document.querySelector('.parkingSpaceForm__ssnField').innerHTML = optionsHTML;
						}
						if (this.status == 500) {
							formInputLoadingMsgHTML.innerHTML = "Error!";
						}
					}
				};
				// Show loading message before sending request to server
				formInputLoadingMsgHTML.innerHTML = "Loading...";
				formInputLoadingMsgHTML.classList.add('formInput__loading--active');
				xhr.send();
				break;
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

	vehicleData.cusFName = form.querySelector('[name="firstName"]').value;
	vehicleData.cusLName = form.querySelector('[name="lastName"]').value;
	vehicleData.phone = form.querySelector('[name="phone"]').value;

	xhr = new XMLHttpRequest();
	xhr.open("POST", "api/vehicleEntry");
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.onreadystatechange = function () {
		var msg;
		if (this.readyState == 4) {
			if (this.status == 200) {
				var responseText = JSON.parse(this.responseText);
				msg = "Token number " + responseText.number + " (REG: " + vehicleData.registration + ") is parked at " + responseText.area + responseText.slot;
			}
			if (this.status == 500) {
				msg = this.responseText;
			}
		}
		showFormResponseMsg(this, form, msg);
	};
	showFormSendingMsg(form);
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
	xhr.onreadystatechange = function () {
		showFormResponseMsg(this, form, "");
	};
	showFormSendingMsg(form);
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
	xhr.onreadystatechange = function () {
		showFormResponseMsg(this, form, "");
	};
	showFormSendingMsg(form);
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
				tableHTML += "<th>" + Object.keys(parkedVehicles[0])[i].replace("_", " ") + "</th>";
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

// View Parking Space statistics
document.querySelector('.sidenav__btn[name="stats"]').addEventListener('click', function() {
	xhr = new XMLHttpRequest();
	xhr.open("GET", "api/viewParkingSpace", true);
	xhr.onreadystatechange = function () {
		if (this.readyState == 4 && this.status == 200) {
			var parkingSpace = JSON.parse(this.responseText);
			var tableHTML = "<table>";
			tableHTML += "<tr>";
			for (var i in Object.keys(parkingSpace[0])) {
				tableHTML += "<th>" + Object.keys(parkingSpace[0])[i].replace("_", " ") + "</th>";
			}
			tableHTML += "</tr>";
			for (i in parkingSpace) {
				tableHTML += "<tr value=" + parkingSpace[i].NUMBER + ">";
				for (var key in parkingSpace[i]) {
					tableHTML += "<td>" + parkingSpace[i][key] + "</td>";
				}
				tableHTML += "</tr>";
			}
			tableHTML += "</table>";
			document.querySelector('.viewParkingSpace').innerHTML = tableHTML;
		}
	};
	xhr.send();
});
