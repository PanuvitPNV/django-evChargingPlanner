
$(document).ready(function() {

    var brand_select = $("#car-brand");
    var brand_list = [];

    $.get("api/ev_car_data", function(data){
        for (var i = 0; i < data.length; i++){
            if (brand_list.includes(data[i].brand)){
                continue;
            }

            brand_select.append($("<option>", {
                class: "brand-select",
                value: data[i].brand,
                text: data[i].brand
            }));

            brand_list.push(data[i].brand);
        }
    });

    $("#car-brand").change(function(){
        var brand = $(this).val();
        var model_select = $("#car-model");
        var battery_capacity = $("#battery-capacity");
        
        battery_capacity.val("");
        model_select.val(model_select.find("option:first").val());

        $("input#charging-checkbox").prop("checked", false);

        $("option[class='model-select']").remove();

        if ( model_select.prop("disabled") ){
            model_select.prop("disabled", false);
        }

        $.get("api/ev_car_data", function(data){
            data.forEach(function(car){
                if (car.brand === brand){
                    model_select.append($("<option>", {
                        class: "model-select",
                        value: car.model,
                        text: car.model
                    }));
                }
            });
        });
    });

    $("#car-model").change(function(){
        var brand = $("#car-brand").val();
        var model = $(this).val();
        var battery_capacity = $("#battery-capacity");

        $.get("api/ev_car_data", function(data){
            data.forEach(function(car){
                if (car.model === model && car.brand === brand){
                    battery_capacity.val(car.useable_capacity.split(" ")[0]);
                    var charging_port = car.charging_port;
                    
                    $("input#charging-checkbox").prop("checked", false);
                    for (var i = 0; i < charging_port.length; i++){
                        $(`#charging-checkbox[name="${charging_port[i]}"]`).prop("checked", true);
                    }
                }
            });
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