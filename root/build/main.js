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
    return { source: "", destination: "", time: "", email: "", totalTime: '', totalKm: '', arrivalTime: '', carType: '', sourceLat: '', sourceLang: '', showDetails: false, loaderText: 'Enter the above details to get remainder', alertClass: 'alert alert-success', customMessage: '' };
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
    this.setState({ showDetails: false, loaderText: 'Enter the above details to get remainder' });
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
                "Set Remainder"
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJDOi9Vc2Vycy9zb29yYWovRGVza3RvcC9hbG1hYmFzZS8wMSAtIEludHJvZHVjdGlvbiAtIFN0YXJ0IEhlcmUvcm9vdC9zY3JpcHRzL2NvbW1vbi5qcyIsIkM6L1VzZXJzL3Nvb3Jhai9EZXNrdG9wL2FsbWFiYXNlLzAxIC0gSW50cm9kdWN0aW9uIC0gU3RhcnQgSGVyZS9yb290L3NjcmlwdHMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7QUNBQSxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDYixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7O0FBRU4sU0FBUyxVQUFVLENBQUMsR0FBRyxFQUFFLElBQUksRUFBRTtBQUNwQyxNQUFJLEdBQUcsR0FBRyxDQUFDO0FBQ1gsTUFBSSxHQUFHLElBQUksQ0FBQztDQUNiOztBQUVNLFNBQVMsY0FBYyxHQUFFO0FBQzlCLE1BQUksV0FBVyxHQUFHLEVBQUMsR0FBRyxFQUFDLElBQUksRUFBRSxJQUFJLEVBQUMsSUFBSSxFQUFDLENBQUM7QUFDeEMsU0FBTyxXQUFXLENBQUM7Q0FDcEI7Ozs7O3dCQ1IwQyxhQUFhOztBQUh4RCxJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDYixJQUFJLElBQUksR0FBRyxDQUFDLENBQUM7QUFDYixJQUFJLElBQUksWUFBTyxDQUFDOztBQUVoQixJQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFOUIsaUJBQWUsRUFBRSwyQkFBVztBQUMzQixXQUFPLEVBQUMsTUFBTSxFQUFHLEVBQUUsRUFBRSxXQUFXLEVBQUMsRUFBRSxFQUFFLElBQUksRUFBQyxFQUFFLEVBQUUsS0FBSyxFQUFDLEVBQUUsRUFBRSxTQUFTLEVBQUMsRUFBRSxFQUFFLE9BQU8sRUFBQyxFQUFFLEVBQUUsV0FBVyxFQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUMsRUFBRSxFQUFFLFNB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QUFpQixFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQUFBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLEFBQUMsR0FBRTthQUNqSjtXQUNIO1VBQ1A7O2NBQUssU0FBUyxFQUFDLFlBQVk7WUFDekI7O2dCQUFLLFNBQVMsRUFBQywyQkFBMkI7Y0FDeEM7O2tCQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLGlCQUFpQixFQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsWUFBWSxBQUFDOztlQUVwRTthQUNMO1dBQ0Y7U0FDSDtRQUVMLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxLQUFLLElBQUksR0FBRzs7WUFBSyxTQUFTLEVBQUMsMkJBQTJCO1VBQzFFOztjQUFHLFNBQVMsRUFBQyxxQkFBcUI7O1dBQXdCO1NBQ3RELEdBQUc7O1lBQUcsU0FBUyxFQUFDLDJCQUEyQjtVQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsVUFBVTtTQUFLO09BRTNFO0tBQ0osQ0FDRjtHQUNIO0NBQ0YsQ0FBQyxDQUFDOztBQUlILFFBQVEsQ0FBQyxNQUFNLENBQ2Isb0JBQUMsT0FBTyxPQUFHLEVBQ1gsUUFBUSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FDbkMsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJ2YXIgcG9zMSA9IDA7XHJcbnZhciBwb3MyID0gMDtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBzZXRQb3NpdG9uKGxhdCwgbGFuZykge1xyXG4gIHBvczEgPSBsYXQ7XHJcbiAgcG9zMiA9IGxhbmc7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRDb29yZGluYXRlcygpe1xyXG4gIHZhciBjb29yZGluYXRlcyA9IHtsYXQ6cG9zMSwgbGFuZzpwb3MyfTtcclxuICByZXR1cm4gY29vcmRpbmF0ZXM7XHJcbn1cclxuIiwidmFyIHBvczEgPSAwO1xyXG52YXIgcG9zMiA9IDA7XHJcbnZhciBzZWxmID0gdGhpcztcclxuaW1wb3J0IHsgc2V0UG9zaXRvbiwgZ2V0Q29vcmRpbmF0ZXMgfSBmcm9tICcuL2NvbW1vbi5qcyc7XHJcbnZhciBNYWluQXBwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xyXG5cclxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xyXG4gICByZXR1cm4ge3NvdXJjZSA6IFwiXCIsIGRlc3RpbmF0aW9uOlwiXCIsIHRpbWU6XCJcIiwgZW1haWw6XCJcIiwgdG90YWxUaW1lOicnLCB0b3RhbEttOicnLCBhcnJpdmFsVGltZTonJywgY2FyVHlwZTonJywgc291cmNlTGF0OicnLCBzb3VyY2VMYW5nOicnLCBzaG93RGV0YWlsczpmYWxzZSwgbG9hZGVyVGV4dDonRW50ZXIgdGhlIGFib3ZlIGRldGFpbHMgdG8gZ2V0IHJlbWFpbmRlcicsYWxlcnRDbGFzczonYWxlcnQgYWxlcnQtc3VjY2VzcycsIGN1c3RvbU1lc3NhZ2U6JycgfTtcclxuIH0sXHJcblxyXG4gIHNlbmRUb0ZpcmViYXNlOiBmdW5jdGlvbigpe1xyXG4gICAgdmFyIGZpcmViYXNlUmVmID0gbmV3IEZpcmViYXNlKFwiaHR0cHM6Ly90YXhpYm9va2VyLWZjZDNlLmZpcmViYXNlaW8uY29tL1wiKTtcclxuICAgIHZhciB0b3RhbFRpbWUgPSB0aGlzLnN0YXRlLnRvdGFsVGltZTtcclxuICAgIHZhciB0cmF2ZWxNaW4gPSB0b3RhbFRpbWUvNjA7XHJcbiAgICB0cmF2ZWxNaW4gPSBNYXRoLnJvdW5kKHRyYXZlbE1pbik7XHJcbiAgICB0cmF2ZWxNaW4gPSB0cmF2ZWxNaW4qNjA7XHJcbiAgICB2YXIgaG1zID0gdGhpcy5zdGF0ZS50aW1lO1xyXG4gICAgdmFyIGEgPSBobXMuc3BsaXQoJzonKTsgLy8gc3BsaXQgaXQgYXQgdGhlIGNvbG9uc1xyXG4gICAgdmFyIHNlY29uZHMgPSAoK2FbMF0pICogNjAgKiA2MCArICgrYVsxXSkgKiA2MDtcclxuICAgIHZhciBkZXBhcnR1cmVUaW1lID0gc2Vjb25kcy10cmF2ZWxNaW47XHJcbiAgICB2YXIgdGltZVRvSGl0VWJlciA9IHNlY29uZHMtKHRyYXZlbE1pbiktKDM2MDApO1xyXG4gICAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xyXG4gICAgdmFyIGhvdXJzID0gZC5nZXRIb3VycygpO1xyXG4gICAgdmFyIG1pbiA9IGQuZ2V0TWludXRlcygpO1xyXG4gICAgdmFyIGN1cnJlbnRTZWNvbmRzID0gKGhvdXJzKjYwKjYwKSsobWluKjYwKTtcclxuICAgIGlmKHRpbWVUb0hpdFViZXI8Y3VycmVudFNlY29uZHMpe1xyXG4gICAgICBhbGVydChcIlNvcnJ5ISEgSXRzIGFscmVhZHkgbGF0ZSwgcmVtaW5kZXIgaXMgc2V0IGZvciB0b21tb3Jyb3dcIik7XHJcbiAgICB9XHJcbiAgICB2YXIgY29vcmRpbmF0ZXMgPSBnZXRDb29yZGluYXRlcygpO1xyXG4gICAgdmFyIGxhdCA9IGNvb3JkaW5hdGVzLmxhdDtcclxuICAgIHZhciBsYW5nID0gY29vcmRpbmF0ZXMubGFuZztcclxuICAgIHZhciBlbWFpbCA9IHRoaXMuc3RhdGUuZW1haWw7XHJcbiAgICB2YXIgbmFtZSAgID0gZW1haWwuc3Vic3RyaW5nKDAsIGVtYWlsLmxhc3RJbmRleE9mKFwiQFwiKSk7XHJcbiAgICB2YXIgZG9tYWluID0gZW1haWwuc3Vic3RyaW5nKGVtYWlsLmxhc3RJbmRleE9mKFwiQFwiKSArMSk7XHJcbiAgICB2YXIgdXNlck5hbWU9IG5hbWUrZG9tYWluO1xyXG4gICAgdmFyIHByaW1hcnlLZXkgPSAgdXNlck5hbWUuc3Vic3RyaW5nKDAsIGVtYWlsLmxhc3RJbmRleE9mKFwiLlwiKS0xKTtcclxuICAgIGZpcmViYXNlUmVmLmNoaWxkKHByaW1hcnlLZXkpLnNldCh7a2V5OiBwcmltYXJ5S2V5LCBzb3VyY2U6IHRoaXMuc3RhdGUuc291cmNlLCBkZXN0aW5hdGlvbjp0aGlzLnN0YXRlLmRlc3RpbmF0aW9uICwgdGltZUZvclJlbWluZGVyOjAsIGRlcGFydHVyZVRpbWU6ZGVwYXJ0dXJlVGltZSwgdGltZVRvSGl0VWJlcjp0aW1lVG9IaXRVYmVyLCBsYXQ6bGF0LCBsYW5nOmxhbmcsIGVtYWlsOnRoaXMuc3RhdGUuZW1haWx9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICBpZiAoZXJyb3IgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgIGFsZXJ0KFwiU29tZSBFcnJvciBPY2N1cmVkIFRyeSBBZ2FpblwiKTtcclxuICAgICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgICB9ZWxzZXtcclxuICAgICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dEZXRhaWxzOnRydWV9KTtcclxuICAgICAgICAgICAgIHRoaXMucmVzZXRGb3JtKCk7XHJcbiAgICAgICAgIH1cclxuICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgfSxcclxuXHJcbiAgcmVzZXRGb3JtOiBmdW5jdGlvbigpe1xyXG4gICAgdGhpcy5zZXRTdGF0ZSh7c291cmNlIDogXCJcIiwgZGVzdGluYXRpb246XCJcIiwgdGltZTpcIlwiLCBlbWFpbDpcIlwiLH0pO1xyXG4gIH0sXHJcblxyXG4gIGZpbmREaXN0YW5jZTogZnVuY3Rpb24oKXtcclxuICAgIHZhciB0b3RhbEttID0gJyc7XHJcbiAgICB2YXIgdG90YWxUaW1lID0gJyc7XHJcbiAgICB2YXIgb3JpZ2luID0gdGhpcy5zdGF0ZS5zb3VyY2U7XHJcbiAgICB2YXIgZGVzdGluYXRpb24gPSB0aGlzLnN0YXRlLmRlc3RpbmF0aW9uO1xyXG4gICAgdmFyIHNlcnZpY2UgPSBuZXcgZ29vZ2xlLm1hcHMuRGlzdGFuY2VNYXRyaXhTZXJ2aWNlKCk7XHJcbiAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICBzZXJ2aWNlLmdldERpc3RhbmNlTWF0cml4KFxyXG4gICAgICB7XHJcbiAgICAgICAgb3JpZ2luczogW29yaWdpbl0sXHJcbiAgICAgICAgZGVzdGluYXRpb25zOiBbZGVzdGluYXRpb25dLFxyXG4gICAgICAgIHRyYXZlbE1vZGU6ICdEUklWSU5HJyxcclxuICAgICAgICBkcml2aW5nT3B0aW9uczoge1xyXG4gICAgICAgICAgZGVwYXJ0dXJlVGltZTogbmV3IERhdGUoRGF0ZS5ub3coKSArIDEwMDApLCAgLy8gZm9yIHRoZSB0aW1lIE4gbWlsbGlzZWNvbmRzIGZyb20gbm93LlxyXG4gICAgICAgICAgdHJhZmZpY01vZGVsOiAnb3B0aW1pc3RpYydcclxuICAgICAgICB9LFxyXG4gICAgICAgIGF2b2lkSGlnaHdheXM6IGZhbHNlLFxyXG4gICAgICAgIGF2b2lkVG9sbHM6IGZhbHNlLFxyXG4gICAgICB9LCBjYWxsYmFjay5iaW5kKHRoaXMpKTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGNhbGxiYWNrKHJlc3BvbnNlLCBzdGF0dXMpIHtcclxuICAgICAgICB0b3RhbEttID0gIHJlc3BvbnNlLnJvd3NbMF0uZWxlbWVudHNbMF0uZGlzdGFuY2UudGV4dDtcclxuICAgICAgICB0b3RhbFRpbWUgPSByZXNwb25zZS5yb3dzWzBdLmVsZW1lbnRzWzBdLmR1cmF0aW9uLnZhbHVlO1xyXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe3RvdGFsS206IHRvdGFsS219KTtcclxuICAgICAgICB0aGlzLnNldFN0YXRlKHt0b3RhbFRpbWU6IHRvdGFsVGltZX0pO1xyXG4gICAgICAgIHRoaXMuc2VuZFRvRmlyZWJhc2UoKTtcclxuICAgICAgfVxyXG4gIH0sXHJcblxyXG5ib29rUmVtaW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gIHRoaXMuc2V0U3RhdGUoe2xvYWRlclRleHQ6XCJCb29raW5nIHVuZGVyIHByb2Nlc3MuLi4uLiBwbGVhc2Ugd2FpdFwifSk7XHJcbiAgdGhpcy5nZXRQb3NpdGlvbihzZXRQb3NpdG9uKTtcclxufSxcclxuZ2V0UG9zaXRpb246IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XHJcbiAgdmFyIGdlb2NvZGVyID0gbmV3IGdvb2dsZS5tYXBzLkdlb2NvZGVyKCk7XHJcbiAgdmFyIGxhdD0nJztcclxuICB2YXIgbGFuZyA9Jyc7XHJcbiAgdmFyIGFkZHJlc3MgPSB0aGlzLnN0YXRlLnNvdXJjZTtcclxuICBnZW9jb2Rlci5nZW9jb2RlKCB7ICdhZGRyZXNzJzogYWRkcmVzc30sIGZ1bmN0aW9uKHJlc3VsdHMsIHN0YXR1cykge1xyXG4gIGlmIChzdGF0dXMgPT0gZ29vZ2xlLm1hcHMuR2VvY29kZXJTdGF0dXMuT0spXHJcbiAge1xyXG4gICAgbGF0ID0gcmVzdWx0c1swXS5nZW9tZXRyeS5sb2NhdGlvbi5sYXQoKTtcclxuICAgIGxhbmcgPSByZXN1bHRzWzBdLmdlb21ldHJ5LmxvY2F0aW9uLmxuZygpO1xyXG4gICAgY2FsbGJhY2sobGF0LGxhbmcpO1xyXG4gIH1lbHNle1xyXG4gICAgICAgYWxlcnQoXCJTb21lIEVycm9yIE9jY3VyZWQgVHJ5IEFnYWluXCIpO1xyXG4gICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgfVxyXG59KTtcclxudGhpcy5maW5kRGlzdGFuY2UoKTtcclxufSxcclxuXHJcblxyXG4gIGhhbmRsZUNoYW5nZTogZnVuY3Rpb24oZmllbGQsIGUpIHtcclxuICAgIHRoaXMuc2V0U3RhdGUoe3Nob3dEZXRhaWxzOiBmYWxzZSwgbG9hZGVyVGV4dDonRW50ZXIgdGhlIGFib3ZlIGRldGFpbHMgdG8gZ2V0IHJlbWFpbmRlcid9KTtcclxuICAgIGlmKGZpZWxkPT09XCJzb3VyY2VcIil7XHJcbiAgICAgIHRoaXMuc2V0U3RhdGUoe3NvdXJjZTogZS50YXJnZXQudmFsdWV9KTtcclxuICAgIH1lbHNlIGlmKGZpZWxkPT09XCJkZXN0XCIpe1xyXG4gICAgICB0aGlzLnNldFN0YXRlKHtkZXN0aW5hdGlvbjogZS50YXJnZXQudmFsdWV9KTtcclxuICAgIH1lbHNlIGlmKGZpZWxkPT09XCJlbWFpbFwiKXtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7ZW1haWw6IGUudGFyZ2V0LnZhbHVlfSk7XHJcbiAgICB9ZWxzZSBpZihmaWVsZD09PVwidGltZVwiKXtcclxuICAgICAgdGhpcy5zZXRTdGF0ZSh7dGltZTogZS50YXJnZXQudmFsdWV9KTtcclxuICAgIH1cclxuICB9LFxyXG5cclxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHRpbGVTdHlsZSA9IHtcclxuICAgICAgbWFyZ2luVG9wOjEwXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIHNpbmdsZUJ1dHRvbiA9IHtcclxuICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgbWFyZ2luTGVmdDotODUwLFxyXG4gICAgICBtYXJnaW5Ub3A6IDUwMCxcclxuICAgICAgbWFyZ2luQm90dG9tOiAxMCxcclxuICAgICAgZm9udFNpemU6IDIwLFxyXG4gICAgfVxyXG5cclxuICAgIHZhciBtdWx0aXBsZUJ1dHRvbiA9IHtcclxuICAgICAgcG9zaXRpb246IFwiYWJzb2x1dGVcIixcclxuICAgICAgbWFyZ2luTGVmdDotNTUwLFxyXG4gICAgICBtYXJnaW5Ub3A6IDUwMCxcclxuICAgICAgbWFyZ2luQm90dG9tOiAxMCxcclxuICAgICAgZm9udFNpemU6IDIwLFxyXG4gICAgfVxyXG5cclxuICAgIHZhciBzZXRQYWRkaW5nID0ge1xyXG4gICAgICBhbGlnbkl0ZW1zOlwiY2VudGVyXCIsXHJcbiAgICAgIHBhZGRpbmdMZWZ0OjIwLFxyXG4gICAgICBwYWRkaW5nVG9wOjIwLFxyXG4gICAgICBwYWRkaW5nUmlnaHQ6IDIwLFxyXG4gICAgICBwYWRkaW5nQm90dG9tOiAyMCxcclxuICAgIH1cclxuICAgIHJldHVybiAoXHJcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicm93XCIgc3R5bGU9e3NldFBhZGRpbmd9PlxyXG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLW1kLTEyXCI+XHJcbiAgICAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+Qm9vayBhbiBVYmVyPC9oMj5cclxuICAgICAgICAgICA8Zm9ybSBjbGFzc05hbWU9XCJmb3JtLWhvcml6b250YWxcIiByb2xlPVwiZm9ybVwiPlxyXG4gICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJmb3JtLWdyb3VwXCI+XHJcbiAgICAgICAgICAgICAgIDxsYWJlbCAgY2xhc3NOYW1lPVwiY29sLXNtLTIgY29udHJvbC1sYWJlbFwiPlxyXG4gICAgICAgICAgICAgICAgICBTb3VyY2VcclxuICAgICAgICAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtc20tMTBcIj5cclxuICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiICBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBwbGFjZWhvbGRlcj1cIkVudGVyIHRoZSBuYW1lIG9mIFNvdXJjZVwiIHZhbHVlPXt0aGlzLnN0YXRlLnNvdXJjZX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcywgJ3NvdXJjZScpfS8+XHJcbiAgICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICAgICAgICA8bGFiZWwgIGNsYXNzTmFtZT1cImNvbC1zbS0yIGNvbnRyb2wtbGFiZWxcIj5cclxuICAgICAgICAgICAgICAgICBEZXN0aW5hdGlvblxyXG4gICAgICAgICAgICAgIDwvbGFiZWw+XHJcbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJjb2wtc20tMTBcIj5cclxuICAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgY2xhc3NOYW1lPVwiZm9ybS1jb250cm9sXCIgcGxhY2Vob2xkZXI9XCJFbnRlciB0aGUgbmFtZSBvZiBEZXN0aW5hdGlvblwiIHZhbHVlPXt0aGlzLnN0YXRlLmRlc3RpbmF0aW9ufSBvbkNoYW5nZT17dGhpcy5oYW5kbGVDaGFuZ2UuYmluZCh0aGlzLCAnZGVzdCcpfS8+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICAgICAgICA8bGFiZWwgIGNsYXNzTmFtZT1cImNvbC1zbS0yIGNvbnRyb2wtbGFiZWxcIj5cclxuICAgICAgICAgICAgICAgICBUaW1lXHJcbiAgICAgICAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC1zbS0xMFwiPlxyXG4gICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBjbGFzc05hbWU9XCJmb3JtLWNvbnRyb2xcIiBwbGFjZWhvbGRlcj1cIkVudGVyIHRoZSB0aW1lIGluIGhoOm1tXCIgdmFsdWU9e3RoaXMuc3RhdGUudGltZX0gb25DaGFuZ2U9e3RoaXMuaGFuZGxlQ2hhbmdlLmJpbmQodGhpcywgJ3RpbWUnKX0vPlxyXG4gICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZm9ybS1ncm91cFwiPlxyXG4gICAgICAgICAgICAgICA8bGFiZWwgIGNsYXNzTmFtZT1cImNvbC1zbS0yIGNvbnRyb2wtbGFiZWxcIj5cclxuICAgICAgICAgICAgICAgICAgRW1haWxcclxuICAgICAgICAgICAgICAgPC9sYWJlbD5cclxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29sLXNtLTEwXCI+XHJcbiAgICAgICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIGNsYXNzTmFtZT1cImZvcm0tY29udHJvbFwiIHBsYWNlaG9sZGVyPVwiRW50ZXIgdGhlIGVtYWlsXCIgdmFsdWU9e3RoaXMuc3RhdGUuZW1haWx9IG9uQ2hhbmdlPXt0aGlzLmhhbmRsZUNoYW5nZS5iaW5kKHRoaXMsICdlbWFpbCcpfS8+XHJcbiAgICAgICAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImZvcm0tZ3JvdXBcIj5cclxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbC1zbS1vZmZzZXQtMiBjb2wtc20tMTBcIj5cclxuICAgICAgICAgICAgICAgIDxidXR0b24gdHlwZT1cImJ1dHRvblwiIGNsYXNzTmFtZT1cImJ0biBidG4tcHJpbWFyeVwiIG9uQ2xpY2s9e3RoaXMuYm9va1JlbWluZGVyfT5cclxuICAgICAgICAgICAgICAgICAgU2V0IFJlbWFpbmRlclxyXG4gICAgICAgICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgIDwvZm9ybT5cclxuICAgICAgICB7XHJcbiAgICAgICAgICB0aGlzLnN0YXRlLnNob3dEZXRhaWxzID09PSB0cnVlID8gPGRpdiBjbGFzc05hbWU9XCJjb2wtc20tb2Zmc2V0LTIgY29sLXNtLTEwXCI+XHJcbiAgICAgICAgICAgIDxwIGNsYXNzTmFtZT1cImFsZXJ0IGFsZXJ0LXN1Y2Nlc3NcIj5Cb29raW5nIHN1Y2Nlc3NmdWxsPC9wPlxyXG4gICAgICAgICAgPC9kaXY+IDogPHAgY2xhc3NOYW1lPVwiY29sLXNtLW9mZnNldC0yIGNvbC1zbS0xMFwiPnt0aGlzLnN0YXRlLmxvYWRlclRleHR9PC9wPlxyXG4gICAgICAgIH1cclxuICAgICAgPC9kaXY+XHJcbiAgPC9kaXY+XHJcbiAgICApO1xyXG4gIH1cclxufSk7XHJcblxyXG5cclxuXHJcblJlYWN0RE9NLnJlbmRlcihcclxuICA8TWFpbkFwcCAvPixcclxuICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29udGVudCcpXHJcbik7XHJcbiJdfQ==
