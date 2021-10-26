const mongoose = require('mongoose');
const { Schema } = mongoose;


const monIncomeSchema = new Schema({
	year: { type: String, required: true },
	jan: { type: Number, default: 0 },
	feb: { type: Number, default: 0 },
	mar: { type: Number, default: 0 },
	apr: { type: Number, default: 0 },
	may: { type: Number, default: 0 },
	jun: { type: Number, default: 0 },
	jul: { type: Number, default: 0 },
	aug: { type: Number, default: 0 },
	sep: { type: Number, default: 0 },
	oct: { type: Number, default: 0 },
	nov: { type: Number, default: 0 },
	dec: { type: Number, default: 0 }
});


const MonIncome = new mongoose.model('MonIncome', monIncomeSchema );

module.exports = MonIncome;