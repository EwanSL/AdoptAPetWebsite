const express = require('express');
const fs = require('fs');
const path = require('path');
const session = require('express-session');

const PORT = 3000;

const app = express();

const usersFilePath = path.join(__dirname, 'users.txt');
const petsFilePath = path.join(__dirname, 'pets.txt');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'happytails-secret',
    resave: false,
    saveUninitialized: true
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
  });


// Create Account
const createAccountHtmlPath = path.join(__dirname, 'createAccount.html');

app.post('/createAccount', (req, res) => {
    const { username, password } = req.body;

    const usernameRegex = /^[A-Za-z0-9]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/;

    fs.readFile(createAccountHtmlPath, 'utf8', (err, html) => {
        if (err) return res.status(500).send("Error loading create account page.");

        if (!usernameRegex.test(username)) {
            const updatedHtml = html.replace(
                '<div id="accountMessage"></div>',
                `<div id="accountMessage" style="color: red;">Invalid username format. Use only letters and digits.</div>`
            );
            return res.send(updatedHtml);
        }

        if (!passwordRegex.test(password)) {
            const updatedHtml = html.replace(
                '<div id="accountMessage"></div>',
                `<div id="accountMessage" style="color: red;">Invalid password format. Must be at least 4 characters, include at least one letter and one digit.</div>`
            );
            return res.send(updatedHtml);
        }

        fs.readFile(usersFilePath, 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading users file:', err);
                return res.status(500).send("Server error.");
            }

            const exists = data.split('\n').some(line => {
                const [user] = line.split(':');
                return user === username;
            });

            if (exists) {
                const updatedHtml = html.replace(
                    '<div id="accountMessage"></div>',
                    `<div id="accountMessage" style="color: red;">Username already exists. Please choose another.</div>`
                );
                return res.send(updatedHtml);
            }

            const newUser = `${username}:${password}\n`;
            fs.appendFile(usersFilePath, newUser, (err) => {
                if (err) {
                    console.error('Error writing to users file:', err);
                    return res.status(500).send("Error creating account.");
                }

                const updatedHtml = html.replace(
                    '<div id="accountMessage"></div>',
                    `<div id="accountMessage" style="color: green;">Account created successfully! You can now log in.</div>`
                );
                return res.send(updatedHtml);
            });
        });
    });
});

const loginHtmlPath = path.join(__dirname, 'login.html');

app.get('/login.html', (req, res) => {
    fs.readFile(loginHtmlPath, 'utf8', (err, html) => {
        if (err) return res.status(500).send("Error loading login page.");

        const message = req.query.msg || '';
        const updatedHtml = html.replace(
            '<div id="loginMessage"></div>',
            `<div id="loginMessage" style="color: red; font-weight: bold;">${message}</div>`
        );

        res.send(updatedHtml);
    });
});

app.post('/login', (req, res) => {
    const {username, password} = req.body;

    fs.readFile(usersFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading user file:', err);
            return res.send("Server error.");
        }

        const found = data.split('\n').some(line => {
            const [user, pass] = line.trim().split(':');
            return user === username && pass === password;
        });

        fs.readFile(loginHtmlPath, 'utf8', (err, html) => {
            if (found) {
                req.session.user = username;
                const successHtml = html.replace(
                    '<div id="loginMessage"></div>',
                    `<div id="loginMessage" style="color: green;">Successfully logged in!</div>`
                );
                return res.send(successHtml);
            } else {
                const failureHtml = html.replace(
                    '<div id="loginMessage"></div>',
                    `<script>alert('Invalid username or password');</script><div id="loginMessage"></div>`
                );
                return res.send(failureHtml);
            }
        });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send("Logout failed.");
        }

        fs.readFile(path.join(__dirname, 'login.html'), 'utf8', (err, html) => {
            if (err) return res.send("Logged out, but could not load login page.");

            const updatedHtml = html.replace(
                '<div id="loginMessage"></div>',
                `<div id="loginMessage" style="color: blue;">You have been logged out.</div>`
            );
            res.send(updatedHtml);
        });
    });
});

app.get('/giveaway', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login.html?msg=You must be logged in to give away a pet');
    }
    res.sendFile(path.join(__dirname, 'giveaway.html'));
})

// Add the pet to giveaway data in text file
app.post('/submitPet', (req, res) => {
    if (!req.session.user) {
        return res.status(401).send("Unauthorized. Please log in.");
    }

    const { animal, breed, age, gender, getAlongDog, getAlongCat, getAlongChild, additionalComments, currentOwner, ownerEmail } = req.body;

    fs.readFile(petsFilePath, 'utf8', (err, data) => {
        let nextId = 1;

        if (!err && data.trim()) {
            const lines = data.trim().split('\n');
            const lastLine = lines[lines.length -1];
            const lastId = parseInt(lastLine.split(':')[0]);
            nextId = isNaN(lastId) ? 1 : lastId + 1;
        }

        const petRecord = `${nextId}:${req.session.user}:${animal}:${breed}:${age}:${gender}:${getAlongDog}:${getAlongCat}:${getAlongChild}:${additionalComments}:${currentOwner}:${ownerEmail}\n`;
        
        fs.appendFile(petsFilePath, petRecord, (err) => {
            if (err) {
                console.error("Error writing to pets.txt:", err);
                return res.status(500).send("Failed to save pet info.");
            }

            res.send(`<h2>Thank you! Your pet has been listed for adoption.</h2>
                      <a href="/home.html">Back to Home</a>`);
        });
    });
});

//Find pets
app.post('/findPets', (req, res) => {
    const {animal, breed, gender, getAlongDog, getAlongCat, getAlongChild } = req.body;

    fs.readFile(petsFilePath, 'utf8', (err, data) => {
        if (err || !data.trim()) {
            return res.send(`<h2>No pets available for adoption at this time.</h2>
                             <a href="/home.html">Back to Home</a>`);
        }

        const lines = data.trim().split('\n');
        const matchingPets = [];

        lines.forEach(line => {
            const parts = line.split(':'); 

            const [id, username, petAnimal, petBreed, petAge, petGender, petDogFriendly, petCatFriendly, petChildFriendly, comments, ownerName, ownerEmail] = parts;

            const breedMatch = breed.trim().toLowerCase();
            const petBreedMatch = petBreed.trim().toLowerCase();

            const match =
                petAnimal === animal &&
                petGender === gender &&
                (!breedMatch || petBreedMatch === breedMatch) &&
                petDogFriendly === getAlongDog &&
                petCatFriendly === getAlongCat &&
                petChildFriendly === getAlongChild;

            if (match) {
                matchingPets.push({id, petAnimal, petBreed, petAge, petGender, comments, ownerName, ownerEmail });
            }
        });

        let resultHtml = '';

        if (matchingPets.length === 0) {
            resultHtml = "<h2>No matching pets found. Try adjusting your search.</h2>";
        } else {
            resultHtml = `<h2>Matching Pets:<br></h2><table border="1" cellpadding="10">
                <tr><th>Animal</th><th>Breed</th><th>Age</th><th>Gender</th><th>Notes</th><th>Owner</th><th>Email</th></tr>`;

            matchingPets.forEach(pet => {
                resultHtml += `<tr>
                    <td>${pet.petAnimal}</td>
                    <td>${pet.petBreed}</td>
                    <td>${pet.petAge}</td>
                    <td>${pet.petGender}</td>
                    <td>${pet.comments}</td>
                    <td>${pet.ownerName}</td>
                    <td>${pet.ownerEmail}</td>
                </tr>`;
            });

            resultHtml += "</table>";
        }

        injectResults(resultHtml);
    });

    function injectResults(resultsContent) {
        const browseHtmlPath = path.join(__dirname, 'browse.html');

        fs.readFile(browseHtmlPath, 'utf8', (err, template) => {
            if (err) return res.status(500).send("Error loading results page.");

            // Replace placeholder with results
            const finalPage = template.replace('Nothing to see here...', resultsContent);
            res.send(finalPage);
        });
    }
});



app.use(express.static(__dirname));

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});



