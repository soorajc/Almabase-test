var pos1 = 0;
var pos2 = 0;

export function setPositon(lat, lang) {
  pos1 = lat;
  pos2 = lang;
}

export function getCoordinates(){
  var coordinates = {lat:pos1, lang:pos2};
  return coordinates;
}
