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
let service;
let markers = [];
let lastSelectedMarker = null;
let lowest_rating = 1;
let highest_rating = 5;
let newRestaurantData = {};

setupEventListeners();

function setupEventListeners() {
  document.addEventListener("click", (event) => {
    if (event.target.classList.contains("restaurant-card")) {
      markers.forEach(marker => {
        if(marker.restaurant.cssClass === event.target.classList[1]){
          openOverview(marker.restaurant);
        }
      });
    }
    if (event.target.classList.contains("close-overview")) {
      closeOverview();
    }
    if (event.target.classList.contains("add-rating")) {
      openModal(event.target.className);
    }
    if (event.target.classList.contains("cancel-btn")) {
      closeModal();
    }
    if (event.target.classList.contains("rating-confirmation-btn")) {
      addRating();
    }
    if (event.target.classList.contains("new-restaurant-confirmation-btn")) {
      addNewRestaurantOnClick();
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
    zoom: 14,
    minZoom: 13,
    center: defaultCenter,
  };

  // Locate user otpions
  let geoOptions = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000,
  };

  // Locate user
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
      getNearbyRestaurants(this.map.center.lat(), this.map.center.lng());
      updateDisplayedMarkers();
    });

    // Detect when a user click on the map
    google.maps.event.addListener(this.map, 'click', (e) => {
      let newCoords = e.latLng.toJSON();
      newRestaurantData = {...newRestaurantData, coords: newCoords};
      const target = "map";
      openModal(target);
      // Add restaurant
    });

    addRestaurants();
  }

  // Add restaurants from JSON data
  function addRestaurants (){
    data.forEach((restaurant) => {
      createRestaurantEntity(restaurant);
    });
  }

  // Display map
  function displayMap() {
    this.map = new google.maps.Map(mapDiv, mapOptions);
  }
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
      lastSelectedMarker = marker; 
      openOverview(marker.restaurant);
    }
  })(marker, index));
} 

// Open Overview
function openOverview(restaurant) {
  if (restaurant.placeId && restaurant.ratings.length < 1 ){
    getReviews(restaurant);
  }

  let list = document.getElementById("list");
  let overview = document.getElementById("overview");
  let name = document.getElementById("overview-name");
  let picture = document.getElementById("overview-picture");

  let streetView = "https://maps.googleapis.com/maps/api/streetview?size=330x200&location=" + restaurant.lat + "," + restaurant.long + "&pitch=0&key=AIzaSyCxNK2DHeJvw5M6BXbqvb4ZVKq9KnBRZVA";
  
  list.style.display = "none"; 
  name.innerHTML = restaurant.restaurantName;
  picture.src = streetView;
  picture.alt = restaurant.restaurantName;

  displayRatings(restaurant);
  
  overview.style.display = "unset";
}

// Display ratings
function displayRatings(restaurant){
  let ratings = document.getElementById("overview-ratings");
  ratings.innerHTML = "";
  
  restaurant.ratings.forEach(rating => {
    let ratingDiv = document.createElement("div");
    let starsDiv = "<p>" + rating.stars + " ★</p>";
    let commentDiv = "<p>" + rating.comment + "</p>";
    
    ratingDiv.innerHTML = starsDiv + commentDiv;
    ratingDiv.classList.add("review-card");
    ratings.appendChild(ratingDiv);
  });
  
};

// Close Overview
function closeOverview() {
  let list = document.getElementById("list");
  let overview = document.getElementById("overview");
  let ratings = document.getElementById("overview-ratings");

  overview.style.display = "none";
  ratings.innerHTML = "";
  list.style.display = "block";
}

// Filter update
function updateFilter(){
  lowest_rating = parseInt(document.getElementById("lowest-rate").value);
  highest_rating = parseInt(document.getElementById("highest-rate").value);

  updateDisplayedMarkers();
}

// Update Displayed Restaurants 
function updateDisplayedMarkers() {
  markers.forEach(marker => {
    const markerIsVisible = this.map.getBounds().contains(marker.getPosition());
    updateRestaurantVisibility(marker, markerIsVisible);
  })
  updateRestaurantList();
}

// Update restaurant card visiblity 
function updateRestaurantVisibility(marker, markerIsVisible) {
  const restaurant = marker.restaurant;

  if (restaurant.averageRating >= lowest_rating && restaurant.averageRating <= highest_rating ){
    restaurant.isVisible = markerIsVisible;
    marker.setVisible(true);
  }
  else {
    restaurant.isVisible = false;
    marker.setVisible(false);
  }
}

// Update Restaurant Data
function updateRestaurantData(marker) {    
  let restaurant = marker.restaurant;

  let score = 0;
      restaurant.ratings.forEach(rating => {
        score = score + rating.stars;
      });
  const average = (score / restaurant.ratings.length).toFixed(1);;

  restaurant.averageRating = average;

  let div = document.getElementsByClassName(restaurant.restaurantName.split(' ').join(''))[0];
  div.innerHTML = "<h3>" + restaurant.restaurantName + "</h3>" + "<p>" + average + " ★</p>";

  displayRatings(restaurant);
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

// Open modal
function openModal(target){
  const modal = document.getElementById("modal");
  modal.style.display = "block";

  if (target === "add-rating"){
    const addNewRestaurant = document.getElementById("new-restaurant-container");
    const ratingContent = document.getElementById("rating-content-container");
    addNewRestaurant.style.display = "none";
    ratingContent.style.display = "block";
  }
  if (target === "map"){
    const addNewRestaurant = document.getElementById("new-restaurant-container");
    const ratingContent = document.getElementById("rating-content-container");
    ratingContent.style.display = "none";
    addNewRestaurant.style.display = "block";
  }
}

function closeModal(){
  modal.style.display = "none";
}

// Add a review to a restaurant
function addRating(){
  const modal = document.getElementById("modal");
  const ratingContent = document.getElementById("rating-content-container");
  const rating = parseInt(document.getElementById("select-rating").value);
  const comment = document.getElementById("rating-comment").value;

  lastSelectedMarker.restaurant.ratings.push(
    {
      "stars": rating,
      "comment": comment
    }
  )

  updateRestaurantData(lastSelectedMarker);
  closeModal();
}

// Add a new restaurant onClick
function addNewRestaurantOnClick(){
  const modal = document.getElementById("modal");
  const restaurantName = document.getElementById("restaurant-name").value;
  const rating = parseInt(document.getElementById("new-restaurant-rating").value);
  const comment = document.getElementById("new-restaurant-commment").value;
  const coords = newRestaurantData.coords;

  // Fetch Adress
  fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng=" + coords.lat + "," + coords.lng + "&key=AIzaSyCxNK2DHeJvw5M6BXbqvb4ZVKq9KnBRZVA")
  .then((response) => response.json())
  .then((json) => {
    const adress = json.results[0].formatted_address;
    newRestaurantData = newRestaurantData = {...newRestaurantData, adress: adress};

    let restaurant = {
      "restaurantName": restaurantName,
      "address": newRestaurantData.adress,
      "lat": newRestaurantData.coords.lat,
      "long": newRestaurantData.coords.lng,
      "ratings": [
        {
          "stars": rating,
          "comment": comment
        }
      ],
      placeId: null
    }

    createRestaurantEntity(restaurant);
    updateDisplayedMarkers();
    closeModal();
  })
  .catch((error) => {
    console.log(
      "Error:", error.message
    );
  });
}

// Create a new restaurant entity
function createRestaurantEntity(restaurant) {
  const name = restaurant.restaurantName; 
  const cssClass = name.split(' ').join('');
  const coords = {
    lat: restaurant.lat,
    lng: restaurant.long,
  };
  let score = 0;
  restaurant.ratings.forEach(rating => {
    score = score + rating.stars;
  });
  const average = (score / restaurant.ratings.length).toFixed(1);;

  restaurant = {
    ...restaurant, 
    isVisible: true, 
    cssClass : cssClass, 
    averageRating : average,
    placeId: null
  };
  const index = markers.length;

  addMarker(coords, name, index, restaurant);
  
  let div = document.createElement("div");
  div.classList.add("restaurant-card");
  div.classList.add(cssClass);
  div.innerHTML = "<h3>" + name + "</h3>" + "<p>" + average + " ★</p>";

  list.appendChild(div);

  return restaurant;
}

// Get the nearby restaurants from Google Places API
function getNearbyRestaurants(lat, lng) {

  let location = new google.maps.LatLng(lat,lng);
  let service = new google.maps.places.PlacesService(this.map);
  let request = {
    location: location,
    radius: '1500',
    type: ['restaurant']
  };

  service.nearbySearch(request, callback);

  function callback(results, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      for (var i = 0; i < results.length; i++) {
        let alreadyRegistered = checkIfAlreadyRegistered(results[i].name);
        
        if (!alreadyRegistered){          
          let lat = results[i].geometry.location.lat();
          let lng = results[i].geometry.location.lng();
          let coords = {
            lat,
            lng
          };
          const cssClass = results[i].name.split(' ').join('');
          let average = results[i].rating;
  
          let restaurant = {
            restaurantName: results[i].name,
            address: results[i].vicinity,
            lat : lat,
            long : lng,
            ratings: [],
            averageRating: average,
            cssClass : cssClass,
            isVisible: true,
            placeId: results[i].place_id
          }
  
          addMarker(coords, restaurant.restaurantName, markers.length, restaurant)
  
          let div = document.createElement("div");
          div.classList.add("restaurant-card");
          div.classList.add(cssClass);
          div.innerHTML = "<h3>" + restaurant.restaurantName + "</h3>" + "<p>" + average + " ★</p>";
  
          list.appendChild(div);
        }
      }
    }
    
    updateDisplayedMarkers();
  }
}

// Check if a restaurant is already registered
function checkIfAlreadyRegistered(restaurantName){
  markers.forEach(marker => {
    if (marker.restaurant.restaurantName === restaurantName){
      return true;
    }
  });
  return false;
}

// Get the comments from Google Places API 
function getReviews(restaurant){
  let request = {
    placeId: restaurant.placeId,
    fields: ['reviews']
  };

  service = new google.maps.places.PlacesService(this.map);
  service.getDetails(request, callback);
  
  function callback(reviews, status) {
    if (status == google.maps.places.PlacesServiceStatus.OK) {
      reviews.reviews.forEach( review => {
        restaurant.ratings.push(
          {
            stars: review.rating,
            comment: review.text
          }
        )
      });
    }
    displayRatings(restaurant);
  }
}