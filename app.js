/** @format */

let data;

fetch("data.json")
  .then((response) => response.json())
  .then((json) => {
    data = json;
  })
  .catch(function (error) {
    console.log(
      "Il y a eu un problème avec l'opération fetch: " + error.message
    );
  });

console.log(data);

function initMap() {
  const paris = { lat: 48.856614, lng: 2.3522219 };
  const defaultCenter = paris;

  const mapDiv = document.getElementById("map");
  var map;

  // Map options
  let mapOptions = {
    zoom: 13,
    center: defaultCenter,
  };

  // Locate user otpions
  let geoOptions = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000,
  };

  // Locate  user
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (position) {
      updatePosition(position.coords.latitude, position.coords.longitude),
        geoOptions;
    });
  } else {
    console.log("Unable to get the location");
    displayMap();
  }

  // Center the map on the user
  function updatePosition(newLatitude, newLongitude) {
    mapOptions.center = {
      lat: newLatitude,
      lng: newLongitude,
    };

    this.map = displayMap();

    var userMarker = new google.maps.Marker({
      position: mapOptions.center,
      map: this.map,
      icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
    });
  }

  // Add restaurants from JSON data
  restaurants.array.forEach((restaurant) => {
    const coords = {
      lat: restaurant.lat,
      lng: restaurant.long,
    };
    addMarker(coords);
  });

  function displayMap() {
    var map = new google.maps.Map(mapDiv, mapOptions);

    return map;
  }
}

function addMarker(coords) {
  let marker = new google.maps.Marker({
    position: coords,
    map: map,
  });

  console.log("Add marker at");
  console.log(coords);

  return marker;
}
