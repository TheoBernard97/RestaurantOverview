/** @format */

let data;

fetch("./data.json")
  .then((response) => response.json())
  .then((json) => {
    data = json;
  })
  .catch((error) => {
    console.log(
      "Il y a eu un problème avec l'opération fetch: ${error.message}"
    );
  });

let map;

function initMap() {
  const paris = { lat: 48.856614, lng: 2.3522219 };
  const defaultCenter = paris;

  const mapDiv = document.getElementById("map");

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
    navigator.geolocation.getCurrentPosition((position) => {
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

    displayMap();

    let userMarker = new google.maps.Marker({
      position: mapOptions.center,
      map: this.map,
      icon: "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png",
      title: "User"
    });

    addRestaurants();
  }

  function addRestaurants (){
    // Add restaurants from JSON data
    data.forEach((restaurant) => {
      
      addMarker({
        lat: restaurant.lat,
        lng: restaurant.long,
      }, restaurant.restaurantName);
    });
  }

  // Add marker
  function addMarker(coords, name) {
    let marker = new google.maps.Marker({
      position: coords,
      title: name
    });

    marker.setMap(this.map)
  } 

  function displayMap() {
    this.map = new google.maps.Map(mapDiv, mapOptions);
  }
}


