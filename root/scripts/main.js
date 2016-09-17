var pos1 = 0;
var pos2 = 0;
var self = this;
import { setPositon, getCoordinates } from './common.js';
var MainApp = React.createClass({

  getInitialState: function() {
   return {source : "", destination:"", time:"", email:"", totalTime:'', totalKm:'', arrivalTime:'', carType:'', sourceLat:'', sourceLang:'', showDetails:false, loaderText:'Enter the above details to set reminder',alertClass:'alert alert-success', customMessage:'' };
 },

  sendToFirebase: function(){
    var firebaseRef = new Firebase("https://taxibooker-fcd3e.firebaseio.com/");
    var totalTime = this.state.totalTime;
    var travelMin = totalTime/60;
    travelMin = Math.round(travelMin);
    travelMin = travelMin*60;
    var hms = this.state.time;
    var a = hms.split(':'); // split it at the colons
    var seconds = (+a[0]) * 60 * 60 + (+a[1]) * 60;
    var departureTime = seconds-travelMin;
    var timeToHitUber = seconds-(travelMin)-(3600);
    var d = new Date();
    var hours = d.getHours();
    var min = d.getMinutes();
    var currentSeconds = (hours*60*60)+(min*60);
    if(timeToHitUber<currentSeconds){
      alert("Sorry!! Its already late, reminder is set for tommorrow");
    }
    var coordinates = getCoordinates();
    var lat = coordinates.lat;
    var lang = coordinates.lang;
    var email = this.state.email;
    var name   = email.substring(0, email.lastIndexOf("@"));
    var domain = email.substring(email.lastIndexOf("@") +1);
    var userName= name+domain;
    var primaryKey =  userName.substring(0, email.lastIndexOf(".")-1);
    firebaseRef.child(primaryKey).set({key: primaryKey, source: this.state.source, destination:this.state.destination , timeForReminder:0, departureTime:departureTime, timeToHitUber:timeToHitUber, lat:lat, lang:lang, email:this.state.email}, function(error) {
         if (error !== null) {
             alert("Some Error Occured Try Again");
             location.reload();
         }else{
             this.setState({showDetails:true});
             this.resetForm();
         }
       }.bind(this));
  },

  resetForm: function(){
    this.setState({source : "", destination:"", time:"", email:"",});
  },

  findDistance: function(){
    var totalKm = '';
    var totalTime = '';
    var origin = this.state.source;
    var destination = this.state.destination;
    var service = new google.maps.DistanceMatrixService();
    var date = new Date();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: 'DRIVING',
        drivingOptions: {
          departureTime: new Date(Date.now() + 1000),  // for the time N milliseconds from now.
          trafficModel: 'optimistic'
        },
        avoidHighways: false,
        avoidTolls: false,
      }, callback.bind(this));

      function callback(response, status) {
        totalKm =  response.rows[0].elements[0].distance.text;
        totalTime = response.rows[0].elements[0].duration.value;
        this.setState({totalKm: totalKm});
        this.setState({totalTime: totalTime});
        this.sendToFirebase();
      }
  },

bookReminder: function() {
  this.setState({loaderText:"Booking under process..... please wait"});
  this.getPosition(setPositon);
},
getPosition: function(callback) {
  var geocoder = new google.maps.Geocoder();
  var lat='';
  var lang ='';
  var address = this.state.source;
  geocoder.geocode( { 'address': address}, function(results, status) {
  if (status == google.maps.GeocoderStatus.OK)
  {
    lat = results[0].geometry.location.lat();
    lang = results[0].geometry.location.lng();
    callback(lat,lang);
  }else{
       alert("Some Error Occured Try Again");
       location.reload();
  }
});
this.findDistance();
},


  handleChange: function(field, e) {
    this.setState({showDetails: false, loaderText:'Enter the above details to get reminder'});
    if(field==="source"){
      this.setState({source: e.target.value});
    }else if(field==="dest"){
      this.setState({destination: e.target.value});
    }else if(field==="email"){
      this.setState({email: e.target.value});
    }else if(field==="time"){
      this.setState({time: e.target.value});
    }
  },

  render: function() {
    var tileStyle = {
      marginTop:10
    }

    var singleButton = {
      position: "absolute",
      marginLeft:-850,
      marginTop: 500,
      marginBottom: 10,
      fontSize: 20,
    }

    var multipleButton = {
      position: "absolute",
      marginLeft:-550,
      marginTop: 500,
      marginBottom: 10,
      fontSize: 20,
    }

    var setPadding = {
      alignItems:"center",
      paddingLeft:20,
      paddingTop:20,
      paddingRight: 20,
      paddingBottom: 20,
    }
    return (
      <div className="row" style={setPadding}>
        <div className="col-md-12">
           <h2 className="text-center">Book an Uber</h2>
           <form className="form-horizontal" role="form">
             <div className="form-group">
               <label  className="col-sm-2 control-label">
                  Source
               </label>
               <div className="col-sm-10">
                <input type="text"  className="form-control" placeholder="Enter the name of Source" value={this.state.source} onChange={this.handleChange.bind(this, 'source')}/>
               </div>
             </div>
             <div className="form-group">
              <label  className="col-sm-2 control-label">
                 Destination
              </label>
              <div className="col-sm-10">
               <input type="text" className="form-control" placeholder="Enter the name of Destination" value={this.state.destination} onChange={this.handleChange.bind(this, 'dest')}/>
              </div>
            </div>
            <div className="form-group">
              <label  className="col-sm-2 control-label">
                 Time
              </label>
              <div className="col-sm-10">
               <input type="text" className="form-control" placeholder="Enter the time in hh:mm" value={this.state.time} onChange={this.handleChange.bind(this, 'time')}/>
              </div>
            </div>
             <div className="form-group">
               <label  className="col-sm-2 control-label">
                  Email
               </label>
                <div className="col-sm-10">
                  <input type="text" className="form-control" placeholder="Enter the email" value={this.state.email} onChange={this.handleChange.bind(this, 'email')}/>
                </div>
             </div>
            <div className="form-group">
              <div className="col-sm-offset-2 col-sm-10">
                <button type="button" className="btn btn-primary" onClick={this.bookReminder}>
                  Set Reminder
                </button>
              </div>
            </div>
        </form>
        {
          this.state.showDetails === true ? <div className="col-sm-offset-2 col-sm-10">
            <p className="alert alert-success">Booking successfull</p>
          </div> : <p className="col-sm-offset-2 col-sm-10">{this.state.loaderText}</p>
        }
      </div>
  </div>
    );
  }
});



ReactDOM.render(
  <MainApp />,
  document.getElementById('content')
);
