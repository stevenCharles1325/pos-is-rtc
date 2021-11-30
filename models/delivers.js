const mongoose = require('mongoose');
const { Schema } = mongoose;


const deliverSchema = new Schema({
	name: { type: String, required: true },
	dateDelivered: { type: String, required: true }
});

const Deliver = new mongoose.model('Delivers', deliverSchema);

module.exports = Deliver;
