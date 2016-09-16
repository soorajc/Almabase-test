
var Firebase = require("firebase");
var myFirebaseRef = new Firebase("https://taxibooker-fcd3e.firebaseio.com/");
var fs = require('fs');
var path = require('path');
var request = require('request');
var express = require('express');
var nodemailer = require('nodemailer');
var app = express();
var currentSeconds = 0;
setInterval(function(){
  var d = new Date();
  var hours = d.getHours();
  var min = d.getMinutes();
  currentSeconds = (hours*60*60)+(min*60);
myFirebaseRef.orderByChild("timeToHitUber").equalTo(currentSeconds).on("child_added", function(snapshot) {
  var lat = snapshot.val().lat;
  var lang = snapshot.val().lang;
  var email = snapshot.val().email;
  console.log("Time to Hit Uber for",email);
  var primaryKey = snapshot.val().key;
  var departureTime = snapshot.val().departureTime;
  var source = snapshot.val().source;
  var destination = snapshot.val().destination;
  var message = "Its time to book uber for your journey from- "+source+" To-"+destination;
  var url = 'https://api.uber.com/v1/estimates/time?'
  + 'server_token=t487Fy2iZWqz2iTIn126o3DTbU31t1NxDXkDwWO_'
  + '&start_latitude='+lat
  + '&start_longitude='+lang
  request(url, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        var uberArrivalTime = info.times[0].estimate;
        var timeForReminder = departureTime-uberArrivalTime;
        myFirebaseRef.child(primaryKey).set({key: primaryKey,  timeForReminder:timeForReminder, email:email, message:message}, function(error) {
             if (error !== null) {
                 console.log('Unable to push  to Firebase!');
             }else{
                 console.log("push successfull");
             }
      });
    }
});
});
myFirebaseRef.orderByChild("timeForReminder").equalTo(currentSeconds).on("child_added", function(snapshot) {
  var email = snapshot.val().email;
  var message = snapshot.val().message;
  sendEmail(email, message);
});
}, 60000);

function sendEmail(email, message) {
  var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
          user: 'taxibookingreminder@gmail.com',
          pass: 'hbwkvzdudaxruxhc'
      }
  });
  var mailOptions = {
    from: 'taxibookingreminder@gmail.com',
    to: email,
    subject: 'Uber Booking Reminder!!',
    text: message
  };
  transporter.sendMail(mailOptions, function(error, info){
      if(error){
          console.log(error);
      }else{
          console.log('Message sent: ' + info.response);
      };
  });
}


app.set('port', (process.env.PORT || 3000));

app.use('/', express.static(path.join(__dirname, 'root')));

app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});




app.listen(app.get('port'), function() {
  console.log('Server started: http://localhost:' + app.get('port') + '/');
});
