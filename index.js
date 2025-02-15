const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require("path");
app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

const cookie = require('cookie-parser');
app.use(cookie());

const jwt = require('jsonwebtoken');

const bcrypt = require("bcrypt");

const usermodal = require("./mongoose/mongo");

const secret = 'userdata';

app.get('/', (req, res) => {
    res.render('user');
});

app.post('/create', async(req, res) => { //post to write data in server backend and store it
    const { name, email, password, age } = req.body;

    try {
        const finduser = await usermodal.findOne({ email });
        if (finduser) {
            return res.json('User Already Exists');
        }

        bcrypt.hash(password, 5, async(error, result) => {
            if (error) {
                return res.status(500).send('Error Hashing Password');
            }

            try {
                let userdata = await usermodal.create({
                    name,
                    email,
                    password: result,
                    age
                });

                const token = jwt.sign({ email: userdata.email, id: userdata._id }, secret, { expiresIn: '2h' });
                res.cookie("token", token);

                res.status(201).json({ message: "User Created Successfully", userdata, token });

            } catch (err) {
                res.status(500).send('Error Creating User');
            }
        });

    } catch (err) {
        res.status(500).send('Server Error');
    }

});
app.get('/logout', (req, res) => {
    res.cookie('token', '');
    res.redirect('/');
})

app.get('/login', (req, res) => {
    res.render('login');
})
app.post('/login', async(req, res) => {
    let user = await usermodal.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("User not found");

    bcrypt.compare(req.body.password, user.password, (error, result) => {
        console.log(req.body.password)
        if (result) {
            const token = jwt.sign({ email: user.email, id: user._id }, secret, { expiresIn: '2h' });
            res.cookie("token", token);
            res.send("Yes You Can Login ")
        } else {
            return res.status(400).send('You Cannot Login')
        }

    })
})

app.listen(3000, () => {
    console.log('Server On');
});