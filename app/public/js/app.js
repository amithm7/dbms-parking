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
