/** @format */

let data;

fetch("./data.json")
  .then((response) => response.json())
  .then((json) => {
    data = json;
  })
  .catch((error) => {
    console.log(
      "Error: ${error.message}"
    );
  });

let map;
let markers = [];
let restaurants = [];

setupEventListeners();

function setupEventListeners() {
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("close-overview")) {
      closeOverview();
    }
  });
}

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
    
    // Detect when the map viewport changes
    google.maps.event.addListener(this.map, 'idle', () => {
      updateDisplayedRestaurants();
    });

    addRestaurants();
  }

  // Add restaurants from JSON data
  function addRestaurants (){
    data.forEach((restaurant, index) => {

      const name = restaurant.restaurantName;
      const coords = {
        lat: restaurant.lat,
        lng: restaurant.long,
      };

      const cssClass = name.split(' ').join('');

      restaurant = {...restaurant, isVisible: true, cssClass : cssClass};
      restaurants.push(restaurant);

      addMarker(coords, name, index);

      let score = 0;
      restaurant.ratings.forEach(rating => {
        score = score + rating.stars;
      });
      const average = (score / restaurant.ratings.length).toFixed(1);;

      let div = document.createElement("div");
      div.classList.add(cssClass);
      div.innerHTML = "<h3>" + name + "</h3>" + "<p>" + average + " ★</p>";

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
        openOverview(restaurants[index]);
      }
    })(marker, index));
  } 

  // Display map
  function displayMap() {
    this.map = new google.maps.Map(mapDiv, mapOptions);
  }
}

// Open Overview
function openOverview(restaurant) {
  let list = document.getElementById("list");
  let overview = document.getElementById("overview");
  let name = document.getElementById("overview-name");
  let ratings = document.getElementById("overview-ratings");
  
  list.style.display = "none"; 
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
  let list = document.getElementById("list");
  let overview = document.getElementById("overview");
  let ratings = document.getElementById("overview-ratings");

  overview.style.display = "none";
  ratings.innerHTML = "";
  list.style.display = "block";
}

// Update Displayed Restaurants 
function updateDisplayedRestaurants() {
  markers.forEach(marker => {
    const markerIsVisible = this.map.getBounds().contains(marker.getPosition());
    updateRestaurantVisibility(markerIsVisible, marker.title);
    updateRestaurantList();
  })
}

// Update restaurant visiblity 
function updateRestaurantVisibility(isVisible, restaurantName) {
  restaurants.forEach(restaurant => {
    if (restaurant.restaurantName === restaurantName){
      restaurant.isVisible = isVisible;
    }
  })
}

function updateRestaurantList() {
  restaurants.forEach(restaurant => {
    let div = document.getElementsByClassName(restaurant.cssClass)[0];
    if (restaurant.isVisible){
      div.style.display = "block";
    }
    else {
      div.style.display = "none";
    }
  })
}