// Global variable to store the map.
let map;

// Async function to load the Google Maps JavaScript API
const { Map } = await google.maps.importLibrary("maps");
const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");
const { Autocomplete } = await google.maps.importLibrary("places");
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

const directionsService = new google.maps.DirectionsService();
const directionsRenderer = new google.maps.DirectionsRenderer();

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
    //   mapId: 'aa02cb992666fba3',
      styles: [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        },
      ],
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

    console.log(request);

    var cookies = {
      manual_input: manual_input,
      car_brand: car_brand,
      car_model: car_model,
      battery_capacity: battery_capacity,
      charging_ports: charging_ports.join(",")
    }

    setCookie(cookies, 180);
    $("dialog#route-calculation-modal").prop("open", true);

    $.ajax({
        url: 'https://api-ev-charging-planner-be9tw.ondigitalocean.app/optimize',
        type: 'POST',
        crossDomain: true,
        data: JSON.stringify(request),
        contentType: "application/json;",
        traditional: true,
        beforeSend: function(){
          $("dialog#info-modal article details#summary li").remove();
          $("dialog#info-modal article details#charging-stops ol li").remove();
        },
        complete: function(){
          $("dialog#route-calculation-modal").prop("open", false);
        },
        success: function(data){
            console.log(data);
            if (data.status === "success"){
              $("dialog#info-modal article details#summary").append(`<li>Estimated time: ${convertTime(data["total time"])}</li>`);
              
              for (var i = 0; i < data["solution detail"].length; i++){
                $("dialog#info-modal article details#charging-stops ol").append(`
                <li><i class="fa-solid fa-charging-station"></i> Details: 
                  <ul>
                    <li>Station name: ${data["solution detail"][i].Name}</li>
                    <li>Address: ${data["solution detail"][i].Address}</li>
                    <li>Arrival battery: ${data["solution data"]["arrival battery"][i]*battery_capacity} kWh</li>
                    <li>Target battery: ${data["solution data"]["target battery"][i]*battery_capacity} kWh</li>
                    <li>Charging time: ${convertTime(data["solution data"]["charging time"][i])}</li>
                    <li>Driving time: ${convertTime(data["solution data"]["driving time"][i])}</li>
                    <li>Total time: ${convertTime(data["solution data"]["total time"][i])}</li>
                  </ul>
                </li>`);
              }

              calculateAndDisplayRoute(data, origin, destination);
              $("html, body").animate({ scrollTop: document.body.scrollHeight }, "slow");
            }else{
              alert("Error: failed to optimize route, Please try again.");
            }
        },
        error: function(error){
          console.log(error);
        }

    });
  });

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
  
  populateCookie();

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


function convertTime(time){
  var hours = Math.floor(time);
  var minutes = Math.floor((time - hours) * 60);
  var seconds = Math.round((time - hours - minutes / 60) * 3600);
  return `${hours} hours ${minutes} minutes ${seconds} seconds`;
}
