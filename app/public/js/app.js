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
	vehicleData.type = form.querySelector('[name="type"]').value;

	xhr = new XMLHttpRequest();
	xhr.open("POST", "api/vehicleEntry");
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send(JSON.stringify(vehicleData));
});
