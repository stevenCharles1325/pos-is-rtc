const mongoose = require('mongoose');
const { Schema } = mongoose;


const userSchema = new Schema({
	role: { type: String, required: true },
	firstName: { type: String },
	middleName: { type: String },
	lastName: { type: String },
	email: { type: String },
	number: { type: String },
	username: { type: String, required: true },
	password: { type: String, required: true }
});

const User = mongoose.model('Users', userSchema);

module.exports = User;