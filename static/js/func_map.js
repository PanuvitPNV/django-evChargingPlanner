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
  $("#search-direction-button").click(function(){
    var origin = $("#search-origin").val();
    var destination = $("#search-destination").val();
    var car_brand = $("#car-brand").val();
    var car_model = $("#car-model").val();
    var battery_initial = $("#initInputId").val();
    var battery_arrival = $("#arrivalInputId").val();
    var battery_capacity = $("#battery-capacity").val();
    var charging_ports = [];

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

    $.ajax({
        url: 'https://api-ev-charging-planner-be9tw.ondigitalocean.app/optimize',
        type: 'POST',
        crossDomain: true,
        data: JSON.stringify(request),
        contentType: "application/json;",
        traditional: true,
        beforeSend: function(){
            
        },
        complete: function(){
            $("#loading-screen").remove();
        },
        success: function(data){
            console.log(data);
            if (data.status === "success"){
                calculateAndDisplayRoute(data, origin, destination);
            }else{
                alert("Error: failed to optimize route.");
            }
        },
        error: function(error){
            console.log(error);
        }

    });
  });

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