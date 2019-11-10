function initLogin() {
	console.log("log");
	document.querySelector(".entry").classList.add("entry--hidden");
	document.querySelector(".entryForm").classList.remove("entryForm--hidden");
}

function initSignup() {
	console.log("sign");
	document.querySelector(".entry").classList.add("entry--hidden");
	document.querySelector(".entryForm").classList.remove("entryForm--hidden");
}

function closeEntryForm() {
	document.querySelector(".entry").classList.remove("entry--hidden");
	document.querySelector(".entryForm").classList.add("entryForm--hidden");
}

document.querySelector(".entry__login").addEventListener("click", initLogin);
// document.querySelector(".entry__signup").addEventListener("click", initSignup);
document.querySelector(".entryForm__cancel").addEventListener("click", closeEntryForm);
