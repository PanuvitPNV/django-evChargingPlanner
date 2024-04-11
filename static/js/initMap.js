// Global variable to store the map.
let map;

// Async function to load the Google Maps JavaScript API
const { Map } = await google.maps.importLibrary("maps");
const { DirectionsService, DirectionsRenderer } = await google.maps.importLibrary("routes");
const { Autocomplete } = await google.maps.importLibrary("places");
const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

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

  new AutocompleteDirectionsHandler(map);
}


class AutocompleteDirectionsHandler {
  map;
  originPlaceId;
  destinationPlaceId;
  originCoordinates;
  destinationCoordinates;
  travelMode;
  directionsService;
  directionsRenderer;

  constructor(map) {
    this.map = map;
    this.originPlaceId = "";
    this.destinationPlaceId = "";
    this.originCoordinates = { lat: 0, lng: 0 };
    this.destinationCoordinates = { lat: 0, lng: 0 };
    this.travelMode = "DRIVING";
    this.directionsService = new DirectionsService();
    this.directionsRenderer = new DirectionsRenderer({ polylineOptions: { strokeColor: "#f821ff" }, suppressMarkers: true});

    this.directionsRenderer.setMap(map);

    const originInput = document.getElementById("search-origin");
    const destinationInput = document.getElementById("search-destination");

    const options = {
        fields: ["place_id", "formatted_address", "geometry", "name"],
        componentRestrictions: {country: "th"}
    };

    originInput.addEventListener("focus", () => {
        originInput.value = "";
    });

    destinationInput.addEventListener("focus", () => {
        destinationInput.value = "";
    });

    // originInput.addEventListener("blur", () => {
    //     if (!originInput.value) {
    //         originInput.place = "กรุณากรอกสถานที่";
    //     }
    // });

    // destinationInput.addEventListener("blur", () => {
    //     if (!destinationInput.value) {
    //         destinationInput.value = "กรุณากรอกสถานที่";
    //     }
    // });

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

    const originAutocomplete = new Autocomplete(originInput, options);
    const destinationAutocomplete = new Autocomplete(destinationInput, options);

    this.setupPlaceChangedListener(originAutocomplete, "ORIG");
    this.setupPlaceChangedListener(destinationAutocomplete, "DEST");

  }

  setupPlaceChangedListener(placeAutocomplete, mode){
    placeAutocomplete.bindTo("bounds", map);
    placeAutocomplete.addListener("place_changed", () => {
      const place = placeAutocomplete.getPlace();

      if (!place.place_id) {
        window.alert("Please select an option from the dropdown list.");
        return;
      }

      if (mode === "ORIG") {
        this.originPlaceId = place.place_id;
        this.originCoordinates = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      } else {
        this.destinationPlaceId = place.place_id;
        this.destinationCoordinates = { lat: place.geometry.location.lat(), lng: place.geometry.location.lng() };
      }

      this.route();
    });

  }

  route() {
    if (!this.originPlaceId || !this.destinationPlaceId) {
      return;
    }

    const me = this;
    this.directionsService.route(
      {
        origin: {placeId: this.originPlaceId},
        destination: {placeId: this.destinationPlaceId},
        waypoints: [
          // {
          //   location: {lat: 18.757285, lng: 98.939909},
          //   stopover: true
          // },
          // {
          //   location: {lat: 18.742497, lng: 98.937067},
          //   stopover: true
          // },
          // {
          //   location: {lat: 18.740252, lng: 98.93572},
          //   stopover: true
          // }

        ],
        optimizeWaypoints: true,
        travelMode: this.travelMode,
      },
      (response, status) => {
        if (status === "OK") {
          me.directionsRenderer.setDirections(response);

          const iconImage = document.createElement("img");
          iconImage.src = `./static/img/station_logo/mg.png`;
          iconImage.style.width = "32px";
          iconImage.style.height = "40px";


          // document.getElementById("search-origin").value = "wowza777";
          const originMarker = new AdvancedMarkerElement({
            map: me.map,
            position: me.originCoordinates,
            // content: iconImage,
            title: "Origin",
          });

          // new google.maps.InfoWindow({
          //   content: "Origin",
          // });

          // originMarker.addListener("click", () => {
          //   new google.maps.InfoWindow({
          //     content: "Origin",
          //   }).open(me.map, originMarker);
          // });

          // document.getElementById("search-destination").value = "wowza777";
          const destinationMarker = new AdvancedMarkerElement({
            map: me.map,
            position: me.destinationCoordinates,
            // content: iconImage,
            title: "Destination",
          });


        } else {
          window.alert("Directions request failed due to " + status);
        }
      }
    );
  }

}


initMap();