(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setPositon = setPositon;
exports.getCoordinates = getCoordinates;
var pos1 = 0;
var pos2 = 0;

function setPositon(lat, lang) {
  pos1 = lat;
  pos2 = lang;
}

function getCoordinates() {
  var coordinates = { lat: pos1, lang: pos2 };
  return coordinates;
}

},{}],2:[function(require,module,exports){
"use strict";

var _commonJs = require('./common.js');

var pos1 = 0;
var pos2 = 0;
var self = undefined;

var MainApp = React.createClass({
  displayName: "MainApp",

  getInitialState: function getInitialState() {
    return { source: "", destination: "", time: "", email: "", totalTime: '', totalKm: '', arrivalTime: '', carType: '', sourceLat: '', sourceLang: '', showDetails: false, loaderText: 'Enter the above details to get reminder', alertClass: 'alert alert-success', customMessage: '' };
  },

  sendToFirebase: function sendToFirebase() {
    var firebaseRef = new Firebase("https://taxibooker-fcd3e.firebaseio.com/");
    var totalTime = this.state.totalTime;
    var travelMin = totalTime / 60;
    travelMin = Math.round(travelMin);
    travelMin = travelMin * 60;
    var hms = this.state.time;
    var a = hms.split(':'); // split it at the colons
    var seconds = +a[0] * 60 * 60 + +a[1] * 60;
    var departureTime = seconds - travelMin;
    var timeToHitUber = seconds - travelMin - 3600;
    var d = new Date();
    var hours = d.getHours();
    var min = d.getMinutes();
    var currentSeconds = hours * 60 * 60 + min * 60;
    if (timeToHitUber < currentSeconds) {
      alert("Sorry!! Its already late, reminder is set for tommorrow");
    }
    var coordinates = (0, _commonJs.getCoordinates)();
    var lat = coordinates.lat;
    var lang = coordinates.lang;
    var email = this.state.email;
    var name = email.substring(0, email.lastIndexOf("@"));
    var domain = email.substring(email.lastIndexOf("@") + 1);
    var userName = name + domain;
    var primaryKey = userName.substring(0, email.lastIndexOf(".") - 1);
    firebaseRef.child(primaryKey).set({ key: primaryKey, source: this.state.source, destination: this.state.destination, timeForReminder: 0, departureTime: departureTime, timeToHitUber: timeToHitUber, lat: lat, lang: lang, email: this.state.email }, (function (error) {
      if (error !== null) {
        alert("Some Error Occured Try Again");
        location.reload();
      } else {
        this.setState({ showDetails: true });
        this.resetForm();
      }
    }).bind(this));
  },

  resetForm: function resetForm() {
    this.setState({ source: "", destination: "", time: "", email: "" });
  },

  findDistance: function findDistance() {
    var totalKm = '';
    var totalTime = '';
    var origin = this.state.source;
    var destination = this.state.destination;
    var service = new google.maps.DistanceMatrixService();
    var date = new Date();
    service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: 'DRIVING',
      drivingOptions: {
        departureTime: new Date(Date.now() + 1000), // for the time N milliseconds from now.
        trafficModel: 'optimistic'
      },
      avoidHighways: false,
      avoidTolls: false
    }, callback.bind(this));

    function callback(response, status) {
      totalKm = response.rows[0].elements[0].distance.text;
      totalTime = response.rows[0].elements[0].duration.value;
      this.setState({ totalKm: totalKm });
      this.setState({ totalTime: totalTime });
      this.sendToFirebase();
    }
  },

  bookReminder: function bookReminder() {
    this.setState({ loaderText: "Booking under process..... please wait" });
    this.getPosition(_commonJs.setPositon);
  },
  getPosition: function getPosition(callback) {
    var geocoder = new google.maps.Geocoder();
    var lat = '';
    var lang = '';
    var address = this.state.source;
    geocoder.geocode({ 'address': address }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        lat = results[0].geometry.location.lat();
        lang = results[0].geometry.location.lng();
        callback(lat, lang);
      } else {
        alert("Some Error Occured Try Again");
        location.reload();
      }
    });
    this.findDistance();
  },

  handleChange: function handleChange(field, e) {
    this.setState({ showDetails: false, loaderText: 'Enter the above details to get reminder' });
    if (field === "source") {
      this.setState({ source: e.target.value });
    } else if (field === "dest") {
      this.setState({ destination: e.target.value });
    } else if (field === "email") {
      this.setState({ email: e.target.value });
    } else if (field === "time") {
      this.setState({ time: e.target.value });
    }
  },

  render: function render() {
    var tileStyle = {
      marginTop: 10
    };

    var singleButton = {
      position: "absolute",
      marginLeft: -850,
      marginTop: 500,
      marginBottom: 10,
      fontSize: 20
    };

    var multipleButton = {
      position: "absolute",
      marginLeft: -550,
      marginTop: 500,
      marginBottom: 10,
      fontSize: 20
    };

    var setPadding = {
      alignItems: "center",
      paddingLeft: 20,
      paddingTop: 20,
      paddingRight: 20,
      paddingBottom: 20
    };
    return React.createElement(
      "div",
      { className: "row", style: setPadding },
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement(
          "h2",
          { className: "text-center" },
          "Book an Uber"
        ),
        React.createElement(
          "form",
          { className: "form-horizontal", role: "form" },
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
              "label",
              { className: "col-sm-2 control-label" },
              "Source"
            ),
            React.createElement(
              "div",
              { className: "col-sm-10" },
              React.createElement("input", { type: "text", className: "form-control", placeholder: "Enter the name of Source", value: this.state.source, onChange: this.handleChange.bind(this, 'source') })
            )
          ),
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
              "label",
              { className: "col-sm-2 control-label" },
              "Destination"
            ),
            React.createElement(
              "div",
              { className: "col-sm-10" },
              React.createElement("input", { type: "text", className: "form-control", placeholder: "Enter the name of Destination", value: this.state.destination, onChange: this.handleChange.bind(this, 'dest') })
            )
          ),
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
              "label",
              { className: "col-sm-2 control-label" },
              "Time"
            ),
            React.createElement(
              "div",
              { className: "col-sm-10" },
              React.createElement("input", { type: "text", className: "form-control", placeholder: "Enter the time in hh:mm", value: this.state.time, onChange: this.handleChange.bind(this, 'time') })
            )
          ),
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
              "label",
              { className: "col-sm-2 control-label" },
              "Email"
            ),
            React.createElement(
              "div",
              { className: "col-sm-10" },
              React.createElement("input", { type: "text", className: "form-control", placeholder: "Enter the email", value: this.state.email, onChange: this.handleChange.bind(this, 'email') })
            )
          ),
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
              "div",
              { className: "col-sm-offset-2 col-sm-10" },
              React.createElement(
                "button",
                { type: "button", className: "btn btn-primary", onClick: this.bookReminder },
                "Set Reminder"
              )
            )
          )
        ),
        this.state.showDetails === true ? React.createElement(
          "div",
          { className: "col-sm-offset-2 col-sm-10" },
          React.createElement(
            "p",
            { className: "alert alert-success" },
            "Booking successfull"
          )
        ) : React.createElement(
          "p",
          { className: "col-sm-offset-2 col-sm-10" },
          this.state.loaderText
        )
      )
    );
  }
});

ReactDOM.render(React.createElement(MainApp, null), document.getElementById('content'));

},{"./common.js":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9zb29yYWovRGVza3RvcC9hbG1hYmFzZS8wMSAtIEludHJvZHVjdGlvbiAtIFN0YXJ0IEhlcmUvcm9vdC9zY3JpcHRzL2NvbW1vbi5qcyIsIkM6L1VzZXJzL3Nvb3Jhai9EZXNrdG9wL2FsbWFiYXNlLzAxIC0gSW50cm9kdWN0aW9uIC0gU3RhcnQgSGVyZS9yb290L3NjcmlwdHMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7QUNBQSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDYixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7O0FBRU4sU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtBQUNwQyxNQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ1gsTUFBSSxHQUFHLElBQUksQ0FBQztDQUNiOztBQUVNLFNBQVMsY0FBYyxHQUFFO0FBQzlCLE1BQUksV0FBVyxHQUFHLEVBQUMsR0FBRyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsSUFBSSxFQUFDLENBQUM7QUFDeEMsU0FBTyxXQUFXLENBQUM7Q0FDcEI7Ozs7O3dCQ1IwQyxhQUFhOztBQUh4RCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDYixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDYixJQUFJLElBQUksWUFBTyxDQUFDOztBQUVoQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFOUIsaUJBQWUsRUFBRSwyQkFBVztBQUMzQixXQUFPLEVBQUMsTUFBTSxFQUFHLEVBQUUsRUFBRSxXQUFXLEVBQUMsRUFBRSxFQUFFLElBQUksRUFBQyxFQUFFLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUMsRUFBRSxFQUFFLE9BQU8sRUFBQyxFQUFFLEVBQUUsV0FBVyxFQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUMsRUFBRSxFQUFFLFNB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QUFpQixFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQUFBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEFBQUMsR0FBRTthQUNqSjtXQUNIO1VBQ1A7O2NBQUssU0FBUyxFQUFDLFlBQVk7WUFDekI7O2dCQUFLLFNBQVMsRUFBQywyQkFBMkI7Y0FDeEM7O2tCQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLGlCQUFpQixFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxBQUFDOztlQUVwRTthQUNMO1dBQ0Y7U0FDSDtRQUVMLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxLQUFLLElBQUksR0FBRzs7WUFBSyxTQUFTLEVBQUMsMkJBQTJCO1VBQzFFOztjQUFHLFNBQVMsRUFBQyxxQkFBcUI7O1dBQXdCO1NBQ3RELEdBQUc7O1lBQUcsU0FBUyxFQUFDLDJCQUEyQjtVQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtTQUFLO09BRTNFO0tBQ0osQ0FDRjtHQUNIO0NBQ0YsQ0FBQyxDQUFDOztBQUlILFFBQVEsQ0FBQyxNQUFNLENBQ2Isb0JBQUMsT0FBTyxPQUFHLEVBQ1gsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FDbkMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcG9zMSA9IDA7XHJcbnZhciBwb3MyID0gMDtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQb3NpdG9uKGxhdCwgbGFuZykge1xyXG4gIHBvczEgPSBsYXQ7XHJcbiAgcG9zMiA9IGxhbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb29yZGluYXRlcygpe1xyXG4gIHZhciBjb29yZGluYXRlcyA9IHtsYXQ6cG9zMSwgbGFuZzpwb3MyfTtcclxuICByZXR1cm4gY29vcmRpbmF0ZXM7XHJcbn1cclxuIiwidmFyIHBvczEgPSAwO1xyXG52YXIgcG9zMiA9IDA7XHJcbnZhciBzZWxmID0gdGhpcztcclxuaW1wb3J0IHsgc2V0UG9zaXRvbiwgZ2V0Q29vcmRpbmF0ZXMgfSBmcm9tICcuL2NvbW1vbi5qcyc7XHJcbnZhciBNYWluQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cclxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xyXG4gICByZXR1cm4ge3NvdXJjZSA6IFwiXCIsIGRlc3RpbmF0aW9uOlwiXCIsIHRpbWU6XCJcIiwgZW1haWw6XCJcIiwgdG90YWxUaW1lOicnLCB0b3RhbEttOicnLCBhcnJpdmFsVGltZTonJywgY2FyVHlwZTonJywgc291cmNlTGF0OicnLCBzb3VyY2VMYW5nOicnLCBzaG93RGV0YWlsczpmYWxzZSwgbG9hZGVyVGV4dDonRW50ZXIgdGhlIGFib3ZlIGRldGFpbHMgdG8gZ2V0IHJlbWluZGVyJyxhbGVydENsYXNzOidhbGVydCBhbGVydC1zdWNjZXNzJywgY3VzdG9tTWVzc2FnZTonJyB9O1xyXG4gfSxcclxuXHJcbiAgc2VuZFRvRmlyZWJhc2U6IGZ1bmN0aW9uKCl7XHJcbiAgICB2YXIgZmlyZWJhc2VSZWYgPSBuZXcgRmlyZWJhc2UoXCJodHRwczovL3RheGlib29rZXItZmNkM2UuZmlyZWJhc2Vpby5jb20vXCIpO1xyXG4gICAgdmFyIHRvdGFsVGltZSA9IHRoaXMuc3RhdGUudG90YWxUaW1lO1xyXG4gICAgdmFyIHRyYXZlbE1pbiA9IHRvdGFsVGltZS82MDtcclxuICAgIHRyYXZlbE1pbiA9IE1hdGgucm91bmQodHJhdmVsTWluKTtcclxuICAgIHRyYXZlbE1pbiA9IHRyYXZlbE1pbio2MDtcclxuICAgIHZhciBobXMgPSB0aGlzLnN0YXRlLnRpbWU7XHJcbiAgICB2YXIgYSA9IGhtcy5zcGxpdCgnOicpOyAvLyBzcGxpdCBpdCBhdCB0aGUgY29sb25zXHJcbiAgICB2YXIgc2Vjb25kcyA9ICgrYVswXSkgKiA2MCAqIDYwICsgKCthWzFdKSAqIDYwO1xyXG4gICAgdmFyIGRlcGFydHVyZVRpbWUgPSBzZWNvbmRzLXRyYXZlbE1pbjtcclxuICAgIHZhciB0aW1lVG9IaXRVYmVyID0gc2Vjb25kcy0odHJhdmVsTWluKS0oMzYwMCk7XHJcbiAgICB2YXIgZCA9IG5ldyBEYXRlKCk7XHJcbiAgICB2YXIgaG91cnMgPSBkLmdldEhvdXJzKCk7XHJcbiAgICB2YXIgbWluID0gZC5nZXRNaW51dGVzKCk7XHJcbiAgICB2YXIgY3VycmVudFNlY29uZHMgPSAoaG91cnMqNjAqNjApKyhtaW4qNjApO1xyXG4gICAgaWYodGltZVRvSGl0VWJlcjxjdXJyZW50U2Vjb25kcyl7XHJcbiAgICAgIGFsZXJ0KFwiU29ycnkhISBJdHMgYWxyZWFkeSBsYXRlLCByZW1pbmRlciBpcyBzZXQgZm9yIHRvbW1vcnJvd1wiKTtcclxuICAgIH1cclxuICAgIHZhciBjb29yZGluYXRlcyA9IGdldENvb3JkaW5hdGVzKCk7XHJcbiAgICB2YXIgbGF0ID0gY29vcmRpbmF0ZXMubGF0O1xyXG4gICAgdmFyIGxhbmcgPSBjb29yZGluYXRlcy5sYW5nO1xyXG4gICAgdmFyIGVtYWlsID0gdGhpcy5zdGF0ZS5lbWFpbDtcclxuICAgIHZhciBuYW1lICAgPSBlbWFpbC5zdWJzdHJpbmcoMCwgZW1haWwubGFzdEluZGV4T2YoXCJAXCIpKTtcclxuICAgIHZhciBkb21haW4gPSBlbWFpbC5zdWJzdHJpbmcoZW1haWwubGFzdEluZGV4T2YoXCJAXCIpICsxKTtcclxuICAgIHZhciB1c2VyTmFtZT0gbmFtZStkb21haW47XHJcbiAgICB2YXIgcHJpbWFyeUtleSA9ICB1c2VyTmFtZS5zdWJzdHJpbmcoMCwgZW1haWwubGFzdEluZGV4T2YoXCIuXCIpLTEpO1xyXG4gICAgZmlyZWJhc2VSZWYuY2hpbGQocHJpbWFyeUtleSkuc2V0KHtrZXk6IHByaW1hcnlLZXksIHNvdXJjZTogdGhpcy5zdGF0ZS5zb3VyY2UsIGRlc3RpbmF0aW9uOnRoaXMuc3RhdGUuZGVzdGluYXRpb24gLCB0aW1lRm9yUmVtaW5kZXI6MCwgZGVwYXJ0dXJlVGltZTpkZXBhcnR1cmVUaW1lLCB0aW1lVG9IaXRVYmVyOnRpbWVUb0hpdFViZXIsIGxhdDpsYXQsIGxhbmc6bGFuZywgZW1haWw6dGhpcy5zdGF0ZS5lbWFpbH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgIGlmIChlcnJvciAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICAgYWxlcnQoXCJTb21lIEVycm9yIE9jY3VyZWQgVHJ5IEFnYWluXCIpO1xyXG4gICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgIH1lbHNle1xyXG4gICAgICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7c2hvd0RldGFpbHM6dHJ1ZX0pO1xyXG4gICAgICAgICAgICAgdGhpcy5yZXNldEZvcm0oKTtcclxuICAgICAgICAgfVxyXG4gICAgICAgfS5iaW5kKHRoaXMpKTtcclxuICB9LFxyXG5cclxuICByZXNldEZvcm06IGZ1bmN0aW9uKCl7XHJcbiAgICB0aGlzLnNldFN0YXRlKHtzb3VyY2UgOiBcIlwiLCBkZXN0aW5hdGlvbjpcIlwiLCB0aW1lOlwiXCIsIGVtYWlsOlwiXCIsfSk7XHJcbiAgfSxcclxuXHJcbiAgZmluZERpc3RhbmNlOiBmdW5jdGlvbigpe1xyXG4gICAgdmFyIHRvdGFsS20gPSAnJztcclxuICAgIHZhciB0b3RhbFRpbWUgPSAnJztcclxuICAgIHZhciBvcmlnaW4gPSB0aGlzLnN0YXRlLnNvdXJjZTtcclxuICAgIHZhciBkZXN0aW5hdGlvbiA9IHRoaXMuc3RhdGUuZGVzdGluYXRpb247XHJcbiAgICB2YXIgc2VydmljZSA9IG5ldyBnb29nbGUubWFwcy5EaXN0YW5jZU1hdHJpeFNlcnZpY2UoKTtcclxuICAgIHZhciBkYXRlID0gbmV3IERhdGUoKTtcclxuICAgIHNlcnZpY2UuZ2V0RGlzdGFuY2VNYXRyaXgoXHJcbiAgICAgIHtcclxuICAgICAgICBvcmlnaW5zOiBbb3JpZ2luXSxcclxuICAgICAgICBkZXN0aW5hdGlvbnM6IFtkZXN0aW5hdGlvbl0sXHJcbiAgICAgICAgdHJhdmVsTW9kZTogJ0RSSVZJTkcnLFxyXG4gICAgICAgIGRyaXZpbmdPcHRpb25zOiB7XHJcbiAgICAgICAgICBkZXBhcnR1cmVUaW1lOiBuZXcgRGF0ZShEYXRlLm5vdygpICsgMTAwMCksICAvLyBmb3IgdGhlIHRpbWUgTiBtaWxsaXNlY29uZHMgZnJvbSBub3cuXHJcbiAgICAgICAgICB0cmFmZmljTW9kZWw6ICdvcHRpbWlzdGljJ1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYXZvaWRIaWdod2F5czogZmFsc2UsXHJcbiAgICAgICAgYXZvaWRUb2xsczogZmFsc2UsXHJcbiAgICAgIH0sIGNhbGxiYWNrLmJpbmQodGhpcykpO1xyXG5cclxuICAgICAgZnVuY3Rpb24gY2FsbGJhY2socmVzcG9uc2UsIHN0YXR1cykge1xyXG4gICAgICAgIHRvdGFsS20gPSAgcmVzcG9uc2Uucm93c1swXS5lbGVtZW50c1swXS5kaXN0YW5jZS50ZXh0O1xyXG4gICAgICAgIHRvdGFsVGltZSA9IHJlc3BvbnNlLnJvd3NbMF0uZWxlbWVudHNbMF0uZHVyYXRpb24udmFsdWU7XHJcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7dG90YWxLbTogdG90YWxLbX0pO1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3RvdGFsVGltZTogdG90YWxUaW1lfSk7XHJcbiAgICAgICAgdGhpcy5zZW5kVG9GaXJlYmFzZSgpO1xyXG4gICAgICB9XHJcbiAgfSxcclxuXHJcbmJvb2tSZW1pbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgdGhpcy5zZXRTdGF0ZSh7bG9hZGVyVGV4dDpcIkJvb2tpbmcgdW5kZXIgcHJvY2Vzcy4uLi4uIHBsZWFzZSB3YWl0XCJ9KTtcclxuICB0aGlzLmdldFBvc2l0aW9uKHNldFBvc2l0b24pO1xyXG59LFxyXG5nZXRQb3NpdGlvbjogZnVuY3Rpb24oY2FsbGJhY2spIHtcclxuICB2YXIgZ2VvY29kZXIgPSBuZXcgZ29vZ2xlLm1hcHMuR2VvY29kZXIoKTtcclxuICB2YXIgbGF0PScnO1xyXG4gIHZhciBsYW5nID0nJztcclxuICB2YXIgYWRkcmVzcyA9IHRoaXMuc3RhdGUuc291cmNlO1xyXG4gIGdlb2NvZGVyLmdlb2NvZGUoIHsgJ2FkZHJlc3MnOiBhZGRyZXNzfSwgZnVuY3Rpb24ocmVzdWx0cywgc3RhdHVzKSB7XHJcbiAgaWYgKHN0YXR1cyA9PSBnb29nbGUubWFwcy5HZW9jb2RlclN0YXR1cy5PSylcclxuICB7XHJcbiAgICBsYXQgPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uLmxhdCgpO1xyXG4gICAgbGFuZyA9IHJlc3VsdHNbMF0uZ2VvbWV0cnkubG9jYXRpb24ubG5nKCk7XHJcbiAgICBjYWxsYmFjayhsYXQsbGFuZyk7XHJcbiAgfWVsc2V7XHJcbiAgICAgICBhbGVydChcIlNvbWUgRXJyb3IgT2NjdXJlZCBUcnkgQWdhaW5cIik7XHJcbiAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcclxuICB9XHJcbn0pO1xyXG50aGlzLmZpbmREaXN0YW5jZSgpO1xyXG59LFxyXG5cclxuXHJcbiAgaGFuZGxlQ2hhbmdlOiBmdW5jdGlvbihmaWVsZCwgZSkge1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7c2hvd0RldGFpbHM6IGZhbHNlLCBsb2FkZXJUZXh0OidFbnRlciB0aGUgYWJvdmUgZGV0YWlscyB0byBnZXQgcmVtaW5kZXInfSk7XHJcbiAgICBpZihmaWVsZD09PVwic291cmNlXCIpe1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHtzb3VyY2U6IGUudGFyZ2V0LnZhbHVlfSk7XHJcbiAgICB9ZWxzZSBpZihmaWVsZD09PVwiZGVzdFwiKXtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZGVzdGluYXRpb246IGUudGFyZ2V0LnZhbHVlfSk7XHJcbiAgICB9ZWxzZSBpZihmaWVsZD09PVwiZW1haWxcIil7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe2VtYWlsOiBlLnRhcmdldC52YWx1ZX0pO1xyXG4gICAgfWVsc2UgaWYoZmllbGQ9PT1cInRpbWVcIil7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3RpbWU6IGUudGFyZ2V0LnZhbHVlfSk7XHJcbiAgICB9XHJcbiAgfSxcclxuXHJcbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgIHZhciB0aWxlU3R5bGUgPSB7XHJcbiAgICAgIG1hcmdpblRvcDoxMFxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzaW5nbGVCdXR0b24gPSB7XHJcbiAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgIG1hcmdpbkxlZnQ6LTg1MCxcclxuICAgICAgbWFyZ2luVG9wOiA1MDAsXHJcbiAgICAgIG1hcmdpbkJvdHRvbTogMTAsXHJcbiAgICAgIGZvbnRTaXplOiAyMCxcclxuICAgIH1cclxuXHJcbiAgICB2YXIgbXVsdGlwbGVCdXR0b24gPSB7XHJcbiAgICAgIHBvc2l0aW9uOiBcImFic29sdXRlXCIsXHJcbiAgICAgIG1hcmdpbkxlZnQ6LTU1MCxcclxuICAgICAgbWFyZ2luVG9wOiA1MDAsXHJcbiAgICAgIG1hcmdpbkJvdHRvbTogMTAsXHJcbiAgICAgIGZvbnRTaXplOiAyMCxcclxuICAgIH1cclxuXHJcbiAgICB2YXIgc2V0UGFkZGluZyA9IHtcclxuICAgICAgYWxpZ25JdGVtczpcImNlbnRlclwiLFxyXG4gICAgICBwYWRkaW5nTGVmdDoyMCxcclxuICAgICAgcGFkZGluZ1RvcDoyMCxcclxuICAgICAgcGFkZGluZ1JpZ2h0OiAyMCxcclxuICAgICAgcGFkZGluZ0JvdHRvbTogMjAsXHJcbiAgICB9XHJcbiAgICByZXR1cm4gKFxyXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInJvd1wiIHN0eWxlPXtzZXRQYWRkaW5nfT5cclxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC1tZC0xMlwiPlxyXG4gICAgICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPkJvb2sgYW4gVWJlcjwvaDI+XHJcbiAgICAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwiZm9ybS1ob3Jpem9udGFsXCIgcm9sZT1cImZvcm1cIj5cclxuICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICA8bGFiZWwgIGNsYXNzTmFtZT1cImNvbC1zbS0yIGNvbnRyb2wtbGFiZWxcIj5cclxuICAgICAgICAgICAgICAgICAgU291cmNlXHJcbiAgICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLXNtLTEwXCI+XHJcbiAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiAgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgcGxhY2Vob2xkZXI9XCJFbnRlciB0aGUgbmFtZSBvZiBTb3VyY2VcIiB2YWx1ZT17dGhpcy5zdGF0ZS5zb3VyY2V9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKHRoaXMsICdzb3VyY2UnKX0vPlxyXG4gICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgPGxhYmVsICBjbGFzc05hbWU9XCJjb2wtc20tMiBjb250cm9sLWxhYmVsXCI+XHJcbiAgICAgICAgICAgICAgICAgRGVzdGluYXRpb25cclxuICAgICAgICAgICAgICA8L2xhYmVsPlxyXG4gICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLXNtLTEwXCI+XHJcbiAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIHBsYWNlaG9sZGVyPVwiRW50ZXIgdGhlIG5hbWUgb2YgRGVzdGluYXRpb25cIiB2YWx1ZT17dGhpcy5zdGF0ZS5kZXN0aW5hdGlvbn0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcywgJ2Rlc3QnKX0vPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgPGxhYmVsICBjbGFzc05hbWU9XCJjb2wtc20tMiBjb250cm9sLWxhYmVsXCI+XHJcbiAgICAgICAgICAgICAgICAgVGltZVxyXG4gICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtc20tMTBcIj5cclxuICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgcGxhY2Vob2xkZXI9XCJFbnRlciB0aGUgdGltZSBpbiBoaDptbVwiIHZhbHVlPXt0aGlzLnN0YXRlLnRpbWV9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKHRoaXMsICd0aW1lJyl9Lz5cclxuICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICAgICAgICAgPGxhYmVsICBjbGFzc05hbWU9XCJjb2wtc20tMiBjb250cm9sLWxhYmVsXCI+XHJcbiAgICAgICAgICAgICAgICAgIEVtYWlsXHJcbiAgICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC1zbS0xMFwiPlxyXG4gICAgICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBwbGFjZWhvbGRlcj1cIkVudGVyIHRoZSBlbWFpbFwiIHZhbHVlPXt0aGlzLnN0YXRlLmVtYWlsfSBvbkNoYW5nZT17dGhpcy5oYW5kbGVDaGFuZ2UuYmluZCh0aGlzLCAnZW1haWwnKX0vPlxyXG4gICAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtc20tb2Zmc2V0LTIgY29sLXNtLTEwXCI+XHJcbiAgICAgICAgICAgICAgICA8YnV0dG9uIHR5cGU9XCJidXR0b25cIiBjbGFzc05hbWU9XCJidG4gYnRuLXByaW1hcnlcIiBvbkNsaWNrPXt0aGlzLmJvb2tSZW1pbmRlcn0+XHJcbiAgICAgICAgICAgICAgICAgIFNldCBSZW1pbmRlclxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZm9ybT5cclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aGlzLnN0YXRlLnNob3dEZXRhaWxzID09PSB0cnVlID8gPGRpdiBjbGFzc05hbWU9XCJjb2wtc20tb2Zmc2V0LTIgY29sLXNtLTEwXCI+XHJcbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImFsZXJ0IGFsZXJ0LXN1Y2Nlc3NcIj5Cb29raW5nIHN1Y2Nlc3NmdWxsPC9wPlxyXG4gICAgICAgICAgPC9kaXY+IDogPHAgY2xhc3NOYW1lPVwiY29sLXNtLW9mZnNldC0yIGNvbC1zbS0xMFwiPnt0aGlzLnN0YXRlLmxvYWRlclRleHR9PC9wPlxyXG4gICAgICAgIH1cclxuICAgICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbiAgICApO1xyXG4gIH1cclxufSk7XHJcblxyXG5cclxuXHJcblJlYWN0RE9NLnJlbmRlcihcclxuICA8TWFpbkFwcCAvPixcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudCcpXHJcbik7XHJcbiJdfQ==
