const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/testdb').then(sucess => {
    console.log('database connected successfully');
}, err => {
    console.log('error connecting database');
})

module.exports = mongoose;