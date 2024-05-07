// Async function to load the Google Maps JavaScript API
const { Map } = await google.maps.importLibrary("maps");
const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");
const { Autocomplete } = await google.maps.importLibrary("places");
const { AdvancedMarkerElement, Marker } = await google.maps.importLibrary("marker");

const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer({suppressMarkers: true});

// Global variable to store the map.
let map;
let markers = [];

// Async function to initialize the map
async function initMap() {
  
  // Default map center location
  const defaultLocation = { lat: 18.80377379840586, lng: 98.95255970304493 };

  // Try to get the user's current location
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const userLocation = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };

    map = new Map(document.getElementById("map"), {
      center: userLocation,
      zoom: 16,
      mapId: 'aa02cb992666fba3',
      disableDefaultUI: true,
    });

  } catch (error) {
    // If getting the user's location fails, use the default location
    map = new Map(document.getElementById("map"), {
      center: defaultLocation,
      zoom: 16,
      mapId: 'aa02cb992666fba3',
      disableDefaultUI: true,
    });
  }

  directionsRenderer.setMap(map);
  map.controls[google.maps.ControlPosition.TOP_RIGHT].push(infoButton());
}

initMap();

// Event listener for the info button
const originInput = document.getElementById("search-origin");
const destinationInput = document.getElementById("search-destination");

originInput.addEventListener("focus", () => {
  originInput.value = "";
});

destinationInput.addEventListener("focus", () => {
  destinationInput.value = "";
});

originInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
  }
});

destinationInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
  }
});

originInput.addEventListener("input", () => {
  if (originInput.value) {
    originInput.classList.remove("is-invalid");
  }
});

destinationInput.addEventListener("input", () => {
  if (destinationInput.value) {
    destinationInput.classList.remove("is-invalid");
  }
});

const options = {
  fields: ["place_id", "formatted_address", "geometry", "name"],
  componentRestrictions: {country: "th"}
};

const originAutocomplete = new Autocomplete(originInput, options);
const destinationAutocomplete = new Autocomplete(destinationInput, options);

// JQuery functions
$(document).ready(function() {
  $("#user-input").on('submit',function(){
    event.preventDefault(); // Prevent the form from submitting normally

    var origin = $("#search-origin").val();
    var destination = $("#search-destination").val();
    var car_brand = $("#car-brand").val();
    var car_model = $("#car-model").val();
    var battery_initial = $("#initInputId").val();
    var battery_arrival = $("#arrivalInputId").val();
    var battery_capacity = $("#battery-capacity").val();
    var charging_ports = [];

    var manual_input = $("#manual-input").is(":checked")

    $("input#charging-checkbox").each(function(){
        if ($(this).prop("checked")){
          charging_ports.push($(this).attr("name"));
        }
    });

    var request = {
      origin_address: origin,
      destination_address: destination,
      car_brand: car_brand,
      car_model: car_model,
      battery_initial: battery_initial,
      battery_arrival: battery_arrival,
      battery_capacity: battery_capacity,
      charging_ports: charging_ports.join(",")
    };

    var cookies = {
      manual_input: manual_input,
      car_brand: car_brand,
      car_model: car_model,
      battery_capacity: battery_capacity,
      charging_ports: charging_ports.join(",")
    }

    setCookie(cookies, 180);
    $("dialog#route-calculation-modal").prop("open", true);
    $("#gmap-links").prop("href", "https://www.google.com/maps");

    $.ajax({
      url: 'https://api-ev-charging-planner-be9tw.ondigitalocean.app/optimize',
      type: 'POST',
      crossDomain: true,
      contentType: "application/json",
      data: JSON.stringify(request),
      beforeSend: function(){
        for (var i = 0; i < markers.length; i++){
          markers[i].setMap(null);
        }
        markers = [];

        $("dialog#info-modal article details#summary li").remove();
        $("dialog#info-modal article details#charging-stops ol li").remove();
      },
      complete: function(){
        $("dialog#route-calculation-modal").prop("open", false);
      },
      success: function(data){
        displayResult(data, origin, destination, battery_capacity);
      },
      error: function(error){
        const errorMessage = error.responseJSON?.error ?? "Server timeout.";
        $("dialog#error-modal article p#error-message").text("An unexpected issue occurred. Please try again later or contact support for further assistance.");
        $("dialog#error-modal article small").html("<strong>ERROR MESSAGE:</strong> " + errorMessage);
        $("dialog#error-modal").prop("open", true);
      }
    });
  });

  function displayResult(response, origin, destination, battery_capacity){
    if (response.status === "success"){
      $("dialog#info-modal article details#summary").append(`<li><b>Estimated time:</b> ${convert_time(response["total time"])}</li>`);
      for (var i = 0; i < response["solution detail"].length; i++){
        const img_url = `static/img/station_logo/${(response["solution detail"][i].Provider).toLowerCase()}.png`;
        const station_address = response["solution detail"][i].Address;
        const station_name = response["solution detail"][i].Name;
        const arrival_battery = convert_battery(response["solution data"]["arrival battery"][i],battery_capacity);
        const target_battery = convert_battery(response["solution data"]["target battery"][i],battery_capacity);
        const charging_time = convert_time(response["solution data"]["charging time"][i]);
        const driving_time = convert_time(response["solution data"]["driving time"][i]);
        const total_time = convert_time(response["solution data"]["total time"][i]);

        $("dialog#info-modal article details#charging-stops ol").append(`
        <li>
          <img src=${img_url} alt="Charging station image" style="width: 30px; height: 30px; border-radius: 50%">
          <b>${response["solution detail"][i].Provider} Station Details:</b>
          <ul>
            <li><b>Station name:</b> ${station_name}</li>
            <li><b>Address:</b> ${station_address}</li>
            <li><b>Arrival battery:</b> ${arrival_battery}%</li>
            <li><b>Target battery:</b> ${target_battery}%</li>
            <li><b>Charging time:</b> ${charging_time}</li>
            <li><b>Driving time:</b> ${driving_time}</li>
            <li><b>Total time:</b> ${total_time}</li>
          </ul>
        </li>`);
      }
      calculateAndDisplayRoute(response, origin, destination);
      $("html, body").animate({ scrollTop: document.body.scrollHeight }, "slow");
      $("dialog#info-modal").prop("open", true);
    }else{
      $("dialog#error-modal article p#error-message").text("We were unable to optimize the route based on the provided locations. Please consider adjusting your starting or destination location and try again.");
      $("dialog#error-modal").prop("open", true);
    }
  }

  function setCookie(cookies, exdays){
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+ d.toUTCString();
    for (var key in cookies){
        document.cookie = key + "=" + cookies[key] + ";" + expires + ";path=/";
    }
  }

  function getCookie(){
    var cookies = {};
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for (var i = 0; i < ca.length; i++){
        var c = ca[i];
        while (c.charAt(0) == ' '){
          c = c.substring(1);
        }
        var key = c.split('=')[0];
        var value = c.split('=')[1];
        cookies[key] = value;
    }
    return cookies;
  }

  function populateCookie(){
    var cookies = getCookie();

    if (cookies["manual_input"] === "true"){
      $("#manual-input").click();
    }

    if (cookies["car_brand"] !== "null" && cookies["car_brand"] !== "" && cookies["car_brand"] !== undefined){
      $("#car-brand").val(cookies["car_brand"]).change();
    }

    if (cookies["car_model"] !== "null" && cookies["car_model"] !== "" && cookies["car_model"] !== undefined){
      $("#car-model").val(cookies["car_model"]).change();
    }

    if (cookies["battery_capacity"] !== "null" && cookies["battery_capacity"] !== "" && cookies["battery_capacity"] !== undefined){
      $("#battery-capacity").val(cookies["battery_capacity"]);
    }

    if (cookies["charging_ports"] !== "null" && cookies["charging_ports"] !== "" && cookies["charging_ports"] !== undefined){
      var charging_ports = cookies["charging_ports"].split(",");
      for (var i = 0; i < charging_ports.length; i++){
        $("input[name=" + charging_ports[i] + "]").prop("checked", true);
      }
    }
  }
  
  setTimeout(() => {
    populateCookie();
    $("#fetch-data-modal").prop("open", false);
  }, 5000);

});

function calculateAndDisplayRoute(response_data, origin, destination){
  const waypts = [];
  var route = response_data["solution detail"];

  for (var i = 0; i < route.length; i++){
    waypts.push({
      location: { lat: route[i].Latitude, lng: route[i].Longitude },
      stopover: true
    });
  }

  var request = {
    origin: origin,
    destination: destination,
    waypoints: waypts,
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING
  };

  directionsService.route(request, function(result, status){
    if (status === google.maps.DirectionsStatus.OK){
      directionsRenderer.setDirections(result);
      
      var origin_leg = result.routes[0].legs[0];
      var destination_leg = result.routes[0].legs[result.routes[0].legs.length - 1];

      markers.push(make_marker(origin_leg.start_location, "origin"));
      markers.push(make_marker(destination_leg.end_location, "destination"));

      for (var i = 0; i < route.length; i++){
        markers.push(make_marker({ lat: route[i].Latitude, lng: route[i].Longitude }, route[i].Provider.toLowerCase(), route[i]));
      }

      navigator_button(result);
    }else{
      alert("Error: failed to optimize route.");
    }
  });

}

function infoButton() {
  var btn = $(`<div id="info-button-container" style="text-align: right; margin: 10px">
                  <button id="info-button" class="contrast" data-target="info-modal" onclick="toggleModal(event)"><i class="fa-solid fa-circle-info"></i></button>
              </div>`);
  return btn[0];
}

function convert_time(time){
  var hours = Math.floor(time);
  var minutes = Math.floor((time - hours) * 60);
  var seconds = Math.round((time - hours - minutes / 60) * 3600);
  return `${hours} hours ${minutes} minutes ${seconds} seconds`;
}

function convert_battery(current, capacity){
  return Math.round((current/capacity)*100);
}

function make_marker(position, title, data = null){
  var marker = new google.maps.Marker({
      position: position,
      map: map,
      icon: {
        url: `static/img/station_marker/${title}.png`,
        scaledSize: new google.maps.Size(36, 45),
      },
  });

  var contentString;

  if (title === "origin" || title === "destination"){
    contentString = `<div class="container"><h6 style="color: black;">${title}</h6></div>`;
  } else {
    contentString = `
    <div class="container" style="max-height: 10rem; overflow-y: auto; margin: 10px;">
      <header>
        <img src="static/img/station_logo/${title}.png" align="left" alt="Charging station image" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 10px;">
        <h6 style="color: black;">${data.Name}</h6>
      </header>
      <div>
        <p style="color: black;"><strong>Provider:</strong> ${data.Provider}</p>
        <p style="color: black;"><strong>Address:</strong> ${data.Address}</p>
        <p style="color: black;"><strong>Power:</strong> ${data.Power}</p>
        <p style="color: black;"><strong>Type1:</strong> ${data.Type1}</p>
        <p style="color: black;"><strong>Type1Count:</strong> ${data.Type1Count}</p>
        <p style="color: black;"><strong>Type2:</strong> ${data.Type2}</p>
        <p style="color: black;"><strong>Type2Count:</strong> ${data.Type2Count}</p>
        <p style="color: black;"><strong>CCS2:</strong> ${data.CCS2}</p>
        <p style="color: black;"><strong>CCS2Count:</strong> ${data.CCS2Count}</p>
        <p style="color: black;"><strong>CHAdeMO:</strong> ${data.CHAdeMO}</p>
        <p style="color: black;"><strong>CHAdeMOCount:</strong> ${data.CHAdeMOCount}</p>
        <p style="color: black;"><strong>Superchargers:</strong> ${data.Superchargers}</p>
        <p style="color: black;"><strong>SuperchargersCount:</strong> ${data.SuperchargersCount}</p>
      </div>
    </div>`;
  }

  var infowindow = new google.maps.InfoWindow({
      content: contentString,
  });

  marker.addListener("click", () => {
      infowindow.open(map, marker);
  });

  return marker;
}

function navigator_button(response) {
  var origin = response.routes[0].legs[0].start_location;
  var destination = response.routes[0].legs[response.routes[0].legs.length - 1].end_location;
  var waypoints = [];

  var origin_location = origin.lat() + "," + origin.lng();
  var destination_location = destination.lat() + "," + destination.lng();

  var url = "https://www.google.com/maps/dir/?api=1&origin=" + origin_location + "&destination=" + destination_location;

  for (var i = 0; i < response.routes[0].legs.length - 1; i++){
    var waypoint = response.routes[0].legs[i].end_location;
    var waypoint_location = waypoint.lat() + "," + waypoint.lng();
    waypoints.push(waypoint_location);
  }

  if (waypoints.length > 0){
    url += "&waypoints=" + waypoints.join("|");
  }

  url += "&travelmode=driving";

  document.getElementById("gmap-links").href = url;
}