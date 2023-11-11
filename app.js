const express = require('express');
const hbs = require('express-hbs');
const bodyParser = require('body-parser');

const app = express();

const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/users");

const UserSchema = new mongoose.Schema({
    name: String
});

const UserModel = mongoose.model("users", UserSchema);

// Example: Insert a single document
const usersData = [
    { name: 'Alice' },
    { name: 'Bob', },
    // Add more users as needed
];

UserModel.create(usersData)
    .then(docs => {
        console.log('Documents inserted:', docs);
    })
    .catch(err => {
        console.error('Error inserting documents:', err);
    });

    app.get("/getUsers", (req, res) => {
        console.log('Endpoint accessed: /getUsers');
        UserModel.find({})
            .then(function (users) {
                console.log('Found users:', users);
                res.json(users);
            })
            .catch(function (err) {
                console.error('Error fetching users:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            });
    });
    
    // CRUD: Create - Add a new user
    app.post('/addUser', function (req, res) {
        const form = req.body;
        console.log('Form data:', form);
    
        const newUser = new UserModel({
            name: form.username // Assuming your form has a 'username' field
        });
    
        newUser.save()
            .then(doc => {
                console.log('User added successfully:', doc);
                res.redirect('/getUsers'); // Redirect to the list of users
            })
            .catch(err => {
                console.error('Error adding user:', err);
                res.status(500).render('error', { error: 'Failed to add user' });
            });
    });
    
    // CRUD: Update - Edit user details
    app.post('/editUser/:id', function (req, res) {
        const userId = req.params.id;
        const updatedData = req.body;
    
        UserModel.findByIdAndUpdate(userId, { name: updatedData.name }, { new: true })
            .then(updatedUser => {
                console.log('User updated successfully:', updatedUser);
                res.redirect('/getUsers'); // Redirect to the list of users
            })
            .catch(err => {
                console.error('Error updating user:', err);
                res.status(500).render('error', { error: 'Failed to update user' });
            });
    });
    
    // CRUD: Delete - Remove a user
    app.post('/deleteUser/:id', function (req, res) {
        const userId = req.params.id;
    
        UserModel.findByIdAndRemove(userId)
            .then(deletedUser => {
                console.log('User deleted successfully:', deletedUser);
                res.redirect('/getUsers'); // Redirect to the list of users
            })
            .catch(err => {
                console.error('Error deleting user:', err);
                res.status(500).render('error', { error: 'Failed to delete user' });
            });
    });
    

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.engine('hbs', hbs.express4({
    partialDir: __dirname + '/views/partials',
    defaultLayout: __dirname + '/views/layout/main.hbs'
}));

const port = process.env.PORT || 8000;
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

app.get('/', function (req, res) {
    res.render('index');
});

app.get("/getUsers", (req, res) => {
    console.log('Endpoint accessed: /getUsers');
    UserModel.find({})
        .then(function (users) {
            console.log('Found users:', users);
            res.json(users);
        })
        .catch(function (err) {
            console.error('Error fetching users:', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});


app.post('/', function (req, res) {
    const form = req.body;
    console.log('Form data:', form);

    if (form.selection === 'Login') {
        if (form.useername !== '' && form.password !== '') {
            console.log("Valid credentials. Rendering welcome page.");

            res.render('welcome',{
                username: form.useername
            });
        } else if (form.useername === '' || form.password === '') {
            console.log("Invalid credentials. Please enter both username and password.");
            res.render('index', {
                message: 'Please enter valid user credentials'
            });
        } else if ((form.username === '' && form.password !== '') || (form.username !== '' && form.password === '')) {
            console.log("Invalid credentials. Please enter both username and password.");
            res.render('index', {
                message: 'Please enter valid user credentials'
            });
        }
    } else if (form.selection === 'Create Profile') {
        console.log("Rendering create profile page.");
        res.render('createprofile');
    }
});

app.post('/createprofile', function (req, res) {
    console.log("Create profile endpoint accessed. Form data:", req.body);
    const form = req.body;

    if (form.fullname === '' || form.username === '' || form.email === '' || form.password === '' || form.confirmpassword === '') {
        console.log("Invalid credentials. Please fill in all fields.");
        res.render('createprofile', {
            message: 'Please enter valid user credentials'
        });
    } else if (form.password !== form.confirmpassword) {
        console.log("Passwords do not match.");
        res.render('createprofile', {
            password: 'The password does not match'
        });
    } else {
        console.log("Profile created successfully.");
        res.render('profilecreated');
    }
});

app.listen(port, () => console.log(`Listening on port ${port}!`));
