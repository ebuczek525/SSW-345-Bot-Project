const mongoose = require('mongoose');

module.exports = {

  connection : mongoose.connection, 

  connect: (url, callback) => mongoose.connect(`mongodb://localhost:27017/${url}`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }) .then(
        () => {
          console.log("success")
          callback(true)
        },
        (error) => {
          console.log(error)
          callback(false)
        },
    ),

  disconnect: (callback) => mongoose.disconnect()
    .then(
      () => {
        callback(true);
      },
      (error) => {
         callback(false)
       
      },
    ),

};