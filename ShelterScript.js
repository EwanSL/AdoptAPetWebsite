// date and time
function dateAndTime() {
    var currentDate = new Date();
    var date = currentDate.toLocaleDateString();
    var time = currentDate.toLocaleTimeString();
    document.getElementById('date-time').innerHTML = date + ' ' + time;
}
setInterval(dateAndTime, 1000);

//validate Find dog/cat form
function validateFind() {
    let isValid = true;
    let errorMessage = "";

    const animal = document.querySelector('input[name="animal"]:checked');
    const breed = document.getElementById('breed').value;
    const gender = document.querySelector('input[name="gender"]:checked');
    const getAlongDog = document.querySelector('input[name="getAlongDog"]:checked');
    const getAlongCat = document.querySelector('input[name="getAlongCat"]:checked');
    const getAlongChild = document.querySelector('input[name="getAlongChild"]:checked');

    if (!animal) {
        errorMessage += "Please select an animal type.\n";
        isValid = false;
    }

    if (breed === "" && !document.getElementById("dontmatter").checked) {
        errorMessage += "Please enter a breed or select 'No preference'.\n";
        isValid = false;
    }

    if (!gender) {
        errorMessage += "Please select a gender preference.\n";
        isValid = false;
    }

    if (!getAlongDog || !getAlongCat || !getAlongChild) {
        errorMessage += "Please answer all compatibility questions (dog, cat, children).\n";
        isValid = false;
    }

    if (!isValid) {
        alert(errorMessage);
        event.preventDefault();
    }

    return isValid;
}


//validate giveaway form
function validateGiveaway() {
    let errorMessage = "";
    let isValid = true;

    const animal = document.querySelector('input[name="animal"]:checked');
    const breed = document.getElementById('breed').value;
    const age = document.getElementById("age").value;
    const gender = document.querySelector('input[name="gender"]:checked');
    const getAlongDog = document.querySelector('input[name="getAlongDog"]:checked');
    const getAlongCat = document.querySelector('input[name="getAlongCat"]:checked');
    const getAlongChild = document.querySelector('input[name="getAlongChild"]:checked');
    const additionalComments = document.getElementById("additionalComments").value;
    const currentOwner = document.getElementById("currentOwner").value;
    const ownerEmail = document.getElementById("ownerEmail").value;

    if (!animal) {
        errorMessage += "Please select Animal type.\n";
        isValid = false;
    }

    if (breed === "") {
        errorMessage += "Please enter the animal breed.\n";
        isValid = false;
    }

    if (age === "choose") {
        errorMessage += "Please select an age preference.\n";
        isValid = false;
    }

    if (!gender) {
        errorMessage += "Please select a gender.\n";
        isValid = false;
    }

    if (!getAlongDog) {
        errorMessage += "Please specify if the animal gets along with other dogs.\n";
        isValid = false;
    }

    if (!getAlongCat) {
        errorMessage += "Please specify if the animal gets along with other cats.\n";
        isValid = false;
    }

    if (!getAlongChild) {
        errorMessage += "Please specify if the animal is suitable for a family with small children.\n";
        isValid = false;
    }

    if (currentOwner === "") {
        errorMessage += "Please enter the owner's full name.\n";
        isValid = false;
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(ownerEmail)) {
        errorMessage += "Please enter a valid email address.\n";
        isValid = false;
    }

    if (!isValid) {
        alert(errorMessage); 
        event.preventDefault(); 
    }

    return isValid;
}


