const mongoose = require('mongoose');
const { Schema } = mongoose;


const itemScheme = new Schema({
	name 	: 	{ type: String, required: true },
	quantity: 	{ type: Number, required: true },
	srp 	: 	{ type: Number, required: true },
	dateDelivered	: 	{ type: Date, required: true },
	dateReleased	: 	{ type: Date, required: true },
	image 	: 	{ type: String }
});


const Items = new mongoose.model('Items', itemScheme);

module.exports = Items;