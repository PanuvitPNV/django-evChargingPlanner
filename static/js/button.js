
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
        if ($(this).prop("checked")) {
          // Reset values before hiding
          $("#car-brand").val($("#car-brand option:first").val());
          $("#car-model").val($("#car-model option:first").val());
          $("#car-brand-label, #car-brand, #car-model-label, #car-model").hide();

          $("input#charging-checkbox").prop("checked", false);
          $("input#charging-checkbox").prop("disabled", false);

          $("#battery-capacity").val("");
          $("#battery-capacity").prop("disabled", false);
        } else {
          // Reset values after showing
          $("#car-brand").val($("#car-brand option:first").val());
          $("#car-model").val($("#car-model option:first").val());
          $("#car-brand-label, #car-brand, #car-model-label, #car-model").show();

          $("input#charging-checkbox").prop("checked", false);
          $("input#charging-checkbox").prop("disabled", true);

          $("#battery-capacity").val("");
          $("#battery-capacity").prop("disabled", true);
        }
      });


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
            },
            error: function(error){
                console.log(error);
            }

        });
    });
    




});