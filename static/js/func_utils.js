
$(document).ready(function() {
    let carData;
  
    fetch("/api/ev_car_data")
      .then(function(response) {
        return response.json();
      })
      .then(function(data) {
        carData = data;
        var brandSelect = $("#car-brand");
        var brandList = [];
  
        data.forEach(function(carData) {
          if (!brandList.includes(carData.brand)) {
            brandSelect.append($("<option>", {
              class: "brand-select",
              value: carData.brand,
              text: carData.brand
            }));
            brandList.push(carData.brand);
          }
        });
      });
  
    $("#car-brand").change(function() {
      var brand = $(this).val();
      var modelSelect = $("#car-model");
      var batteryCapacity = $("#battery-capacity");
  
      batteryCapacity.val("");
      modelSelect.val(modelSelect.find("option:first").val());
      $("input#charging-checkbox").prop("checked", false);
      $("option[class='model-select']").remove();
  
      if (modelSelect.prop("disabled")) {
        modelSelect.prop("disabled", false);
      }
  
      carData.forEach(function(car) {
        if (car.brand === brand) {
          modelSelect.append($("<option>", {
            class: "model-select",
            value: car.model,
            text: car.model
          }));
        }
      });
    });
  
    $("#car-model").change(function() {
      var brand = $("#car-brand").val();
      var model = $(this).val();
      var batteryCapacity = $("#battery-capacity");
  
      carData.forEach(function(car) {
        if (car.model === model && car.brand === brand) {
          batteryCapacity.val(car.battery.useable_capacity.split(" ")[0]);
          var chargingPort = car.charging_port;
          $("input#charging-checkbox").prop("checked", false);
          for (var i = 0; i < chargingPort.length; i++) {
            $(`#charging-checkbox[name="${chargingPort[i]}"]`).prop("checked", true);
          }
        }
      });
    });
  
    $("#manual-input").change(function() {
      const isChecked = $(this).prop("checked");
      const carBrandSelect = $("#car-brand");
      const carModelSelect = $("#car-model");
      const chargingCheckboxes = $("input#charging-checkbox");
      const batteryCapacityInput = $("#battery-capacity");
  
      if (isChecked) {
        // Reset values and disable fields
        carBrandSelect.val(carBrandSelect.find("option:first").val()).prop("disabled", true);
        carModelSelect.val(carModelSelect.find("option:first").val()).prop("disabled", true);
        $("#car-brand-label, #car-brand, #car-model-label, #car-model").hide();
        chargingCheckboxes.prop("checked", false).prop("disabled", false);
        batteryCapacityInput.val("").prop("disabled", false);
      } else {
        // Reset values and enable fields
        carBrandSelect.val(carBrandSelect.find("option:first").val()).prop("disabled", false);
        carModelSelect.val(carModelSelect.find("option:first").val());
        $("#car-brand-label, #car-brand, #car-model-label, #car-model").show();
        chargingCheckboxes.prop("checked", false).prop("disabled", true);
        batteryCapacityInput.val("").prop("disabled", true);
      }
    });
});