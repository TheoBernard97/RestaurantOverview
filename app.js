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
let lowest_rating = 1;
let highest_rating = 5;

setupEventListeners();

function setupEventListeners() {
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("close-overview")) {
      closeOverview();
    }
  });
  
  document.addEventListener("change", (event) => {
    if (event.target.classList.contains("select-filter")) {
      updateFilter();
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
      updateDisplayedMarkers();
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
      
      let score = 0;
      restaurant.ratings.forEach(rating => {
        score = score + rating.stars;
      });
      const average = (score / restaurant.ratings.length).toFixed(1);;

      restaurant = {...restaurant, isVisible: true, cssClass : cssClass, averageRating : average};

      addMarker(coords, name, index, restaurant);

      let div = document.createElement("div");
      div.classList.add("restaurant-card");
      div.classList.add(cssClass);
      div.innerHTML = "<h3>" + name + "</h3>" + "<p>" + average + " ★</p>";

      list.appendChild(div);
    });
  }

  // Add marker
  function addMarker(coords, name, index, restaurant) {
    let marker = new google.maps.Marker({
      position: coords,
      title: name,
      restaurant : restaurant
    });

    marker.setMap(this.map)

    markers.push(marker);
    
    google.maps.event.addListener(marker, 'click', (function(marker) {
      return function() {     
        openOverview(marker.restaurant);
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
  let picture = document.getElementById("overview-picture");
  let ratings = document.getElementById("overview-ratings");

  let streetView = "https://maps.googleapis.com/maps/api/streetview?size=350x200&location=" + restaurant.lat + "," + restaurant.long + "&pitch=0&key=AIzaSyCxNK2DHeJvw5M6BXbqvb4ZVKq9KnBRZVA";
  
  list.style.display = "none"; 
  name.innerHTML = restaurant.restaurantName;
  picture.src = streetView;
  picture.alt = restaurant.restaurantName;
  ratings.innerHTML = "";

  // Add ratings
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

// Update Filter 
function updateFilter(){
  lowest_rating = parseInt(document.getElementById("lowest-rate").value);
  highest_rating = parseInt(document.getElementById("highest-rate").value);

  updateDisplayedMarkers();
}

// Update Displayed Restaurants 
function updateDisplayedMarkers() {
  markers.forEach(marker => {
    const markerIsVisible = this.map.getBounds().contains(marker.getPosition());
    updateRestaurantVisibility(markerIsVisible, marker.title);
    updateRestaurantList();
  })
}

// Update restaurant visiblity 
function updateRestaurantVisibility(isVisible, restaurantName) {
  markers.forEach(marker => {
    const restaurant = marker.restaurant;
    if (restaurant.restaurantName === restaurantName){
      if (restaurant.averageRating >= lowest_rating && restaurant.averageRating <= highest_rating ){
        restaurant.isVisible = isVisible;
        marker.setVisible(true);
      }
      else {
        restaurant.isVisible = false;
        marker.setVisible(false);
      }
    }
  })
}

// Update restaurant list 
function updateRestaurantList() {
  markers.forEach(marker => {
    const restaurant = marker.restaurant;
    let div = document.getElementsByClassName(restaurant.cssClass)[0];
    if (restaurant.isVisible){
      div.style.display = "block";
    }
    else {
      div.style.display = "none";
    }
  })
}