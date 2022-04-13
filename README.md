# Specs

## 1 - Restaurant menu

Start with the foundations of your application. There will be 2 main sections:

- A Google Maps map, loaded with the [Google Maps API](https://developers.google.com/maps/?hl=fr)
- A list of restaurants corresponding to the area displayed on the Google Maps map

You will place these elements side by side.

The Google Maps map will be centered immediately on the user's position. You will use JavaScript's geolocation API. A specific colored marker will be placed at the user's location.

A list of restaurants is provided as JSON data presented in a separate file. Normally, this data would be returned to you by a backend via an API, but for this exercise it will be sufficient for the moment to load all the restaurants in memory directly.

Display these restaurants with their GPS coordinates on the map. Restaurants that are currently visible on the map should be displayed as a list on the side of the map. You will display the average rating of each restaurant (which ranges from 1 to 5 stars).

When you click on a restaurant, the list of saved reviews is displayed with the comments. Also display [the Google Street View photo using the corresponding API](https://developers.google.com/maps/documentation/streetview/?hl=en).

A filter tool allows you to display only restaurants with between X and Y stars. The map is updated in real time.

## 2 - Add restaurants and reviews

Your visitors would love to give restaurant reviews too! Offer them:

- Add an opinion on an existing restaurant
- To add a restaurant, by clicking on a specific place on the map

Once a review or restaurant is added, it immediately appears on the map. A new marker appears to indicate the position of the new restaurant.

The information will not be saved if you leave the page (they just remain in memory during the visit).

## 3 - Integration with Google Places API

At the moment there are not many restaurants and not many reviews. Fortunately, Google Places offers an API to retrieve restaurants and reviews. Use it to display additional restaurants and reviews on your map! Here the documentation: [https://developers.google.com/places/](https://developers.google.com/places/)

![https://user.oc-static.com/upload/2017/09/11/15051445963709_Screen%20Shot%202017-09-11%20at%205.34.49%20PM.png](https://user.oc -static.com/upload/2017/09/11/15051445963709_Screen%20Shot%202017-09-11%20at%205.34.49%20PM.png)

You will use the search api to find restaurants in the displayed area.

Read the documentation carefully to find out how to access Google Places data and do not hesitate to do as many Google searches as necessary when you encounter a problem.

The API costs very little to use (a few euros per thousand requests). But be careful not to make too many requests at once (because of an infinite loop for example). The bill for using the API could rise quickly!