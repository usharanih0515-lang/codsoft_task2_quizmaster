const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const User = require('./models/User');
  const Quiz = require('./models/Quiz');
  
  const student = await User.findOne({role: 'student'});
  if(student) {
    const q = await Quiz.findOneAndUpdate({}, { $set: { assignedStudents: [student._id] } }, { new: true });
    console.log("Assigned student to quiz:", q.assignedStudents);
  } else {
    console.log("No student found");
  }
  process.exit(0);
});
