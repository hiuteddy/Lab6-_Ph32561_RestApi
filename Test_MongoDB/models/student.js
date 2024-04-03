const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    name: { type: String, required: true },
    studentId: { type: String, required: true },
    gpa: { type: String, required: true },
    avatarUrl: { type: String, required: true },
});

module.exports = mongoose.model('Student', studentSchema);
