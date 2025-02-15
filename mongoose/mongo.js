const mongoose = require("mongoose");

const connect = mongoose.connect('mongodb+srv://Samarth:password@cluster0.bag0e.mongodb.net/User-Data?retryWrites=true&w=majority&appName=Cluster0');

const userdata = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    age: Number
})

module.exports = mongoose.model('User', userdata)