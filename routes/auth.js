const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authenticate = require('../middleware/authenticate');
const User = require('../model/userSchema');

/* Sign up */
router.post('/signup', async (req, res) => {
    const { name, email, phone, pass, confirm_pass } = req.body;
    if (!name || !email || !phone || !pass || !confirm_pass) {
        res.status(422).json({ error: "Fill it properly" });
    }
    try {
        const userExist = await User.findOne({ email: email });

        if (userExist) {
            res.status(422).json({ error: "Email already exists!" });
        }
        else if (pass != confirm_pass) {
            res.status(422).json({ error: "Password doesn't match!" });
        }
        else {
            const user = new User({ name: name, email: email, phone: phone, pass: pass, confirm_pass: confirm_pass });
            await user.save();
            res.status(201).json({ message: "User registered!" });
        }
    } catch (err) {
        console.log(err);
    }
});

/* Login route */
router.post('/', async (req, res) => {
    try {
        let token;
        const { email, pass } = req.body;

        if (!email || !pass) {
            res.status(422).json({ error: "Fill details..." })
        }

        const userLogin = await User.findOne({ email: email })

        if (userLogin) {
            const isMatch = await bcrypt.compare(pass, userLogin.pass);

            token = await userLogin.generateAuthToken();
            console.log(token);

            res.cookie("jwtoken", token, {
                // expires: new Date(Date.now + 25892000000),
                maxAge: 86400000,
                httpOnly: true
            });
            console.log("Cookie created");

            if (!isMatch) {
                res.status(400).json({ message: "Wrong credentials!" });
            }
            else {
                res.status(201).json({ message: `Welcome ${userLogin.name} !`, token: token });
            }
        }
        else {
            res.status(422).json({ message: "Wrong credentials!" });
        }
    } catch (err) {
        console.log(err);
    }
});

/* Save Password */
router.post('/save-pass', authenticate, async (req, res) => {
    try {
        const { passFor, password } = req.body;
        if (!passFor || !password) {
            console.log("Error in saving password");
            return res.json({ error: "Please fill the password form" });
        }

        const savePass = await User.findOne({ _id: req.userID });

        if (savePass) {
            const userMessage = await savePass.addPass(passFor, password);
            await savePass.save();
            res.status(201).json({ message: "saved successfully" });
        }

    } catch (err) {
        console.log(err);
    }
})

/* get user data */
router.get('/about', authenticate, (req, res) => {
    console.log("Hello About. ");
    res.send(req.rootUser);
})

router.get('/logout', (req, res) => {
    res.clearCookie('jwtoken', { path: '/' });
    console.log("Hello Logout. ");
    res.status(200).send('User Logged out !');
})

module.exports = router;