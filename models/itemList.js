const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemListScheme = new Schema({
	name 	: 	{ type: String, required: true },
	quantity: 	{ type: Number, required: true },
	srp 	: 	{ type: Number, required: true },
	dateDelivered	: 	{ type: Date, required: true },
	dateReleased	: 	{ type: Date, required: true }
});


const ItemList = new mongoose.model('ItemLists', itemListScheme);

module.exports = ItemList;