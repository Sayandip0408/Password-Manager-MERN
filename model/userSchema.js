const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    pass: {
        type: String,
        required: true
    },
    confirm_pass: {
        type: String,
        required: true
    },
    passwords: [
        {
            passFor: {
                type: String,
                required: true
            },
            password: {
                type: String,
                required: true
            },
        },
    ],
    tokens: [
        {
            token: {
                type: String,
                required: true
            },
        },
    ]
})

/* Hashing */

userSchema.pre('save', async function (next) {
    if (this.isModified('pass')) {
        this.pass = await bcrypt.hash(this.pass, 12);
        this.confirm_pass = await bcrypt.hash(this.confirm_pass, 12);
    }
    next();
});

/* Generating JWT */
userSchema.methods.generateAuthToken = async function () {
    try {
        let userToken = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
        console.log(userToken);
        this.tokens = this.tokens.concat({ token: userToken });
        await this.save();
        return userToken;
    } catch (err) {
        console.log(err);
    }
}

/* Store password */
userSchema.methods.addPass = async function (passFor, password) {
    try {
        this.passwords = this.passwords.concat({ passFor, password });
        await this.save();
        return this.passwords;
    } catch (err) {
        console.log(err);
    }
}

/* Collection Creation */
const User = mongoose.model('USER', userSchema);

module.exports = User;