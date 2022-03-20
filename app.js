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
let markers = [];
let restaurants = [];

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

  // Add restaurants from JSON data
  function addRestaurants (){
    data.forEach((restaurant, index) => {

      restaurants.push(restaurant);

      const name = restaurant.restaurantName;
      const coords = {
        lat: restaurant.lat,
        lng: restaurant.long,
      };

      addMarker(coords, name, index);

      // console.log(markers);
      
      let score = 0;
      restaurant.ratings.forEach(rating => {
        score = score + rating.stars;
      });
      const average = score / restaurant.ratings.length;

      let list = document.getElementById("list");
      let div = document.createElement("div");
      div.innerHTML = "<h3>" + name + "</h3>" + "<p>Note : " + average + "</p>"

      list.appendChild(div);
    });
  }

  // Add marker
  function addMarker(coords, name, index) {
    let marker = new google.maps.Marker({
      position: coords,
      title: name
    });

    marker.setMap(this.map)

    markers.push(marker);
    
    google.maps.event.addListener(marker, 'click', (function(marker, index) {
      return function() {
        list.style.display = "none";      
        openOverview(restaurants[index]);
      }
    })(marker, index));
  } 

  // Open Overview
  function openOverview(restaurant) {
    let overview = document.getElementById("overview");
    let name = document.getElementById("overview-name");
    let ratings = document.getElementById("overview-ratings");
    
    name.innerHTML = restaurant.restaurantName;
    ratings.innerHTML = "";

    restaurant.ratings.forEach(rating => {
      let ratingDiv = document.createElement("div");
      let starsDiv = "<p>" + rating.stars + " ★</p>";
      let commentDiv = "<p>" + rating.comment + "</p>";
      
      ratingDiv.innerHTML = starsDiv + commentDiv;
      ratings.appendChild(ratingDiv);
    });
    
    overview.style.display = "unset";
  }

  // Close Overview
  function closeOverview() {
    let overview = document.getElementById("overview");
    let ratings = document.getElementById("overview-ratings");

    overview.style.display = "none";
    ratings.innerHTML = "";
  }

  // Display map
  function displayMap() {
    this.map = new google.maps.Map(mapDiv, mapOptions);
  }
}


