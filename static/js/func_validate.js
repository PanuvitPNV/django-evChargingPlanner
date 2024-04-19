
$(document).ready(function() {

    // Check if at least one checkbox is checked
    function checkChargingPort() {
        const checkboxes = $("input#charging-checkbox");
        const checkboxLength = checkboxes.length;
        const firstCheckbox = checkboxLength > 0 ? checkboxes[0] : null;
    
        if (firstCheckbox){
            checkboxes.on("change", function() {
                const errorMessage = !isChecked() ? 'At least one checkbox must be selected.' : '';
                firstCheckbox.setCustomValidity(errorMessage);
            });

            // Check if at least one checkbox is checked when search button is clicked
            $("#search-direction").click(function(){
                const errorMessage = !isChecked() ? 'At least one checkbox must be selected.' : '';
                firstCheckbox.setCustomValidity(errorMessage);
            });

        }
    
        function isChecked() {
            return Array.from(checkboxes).some(checkbox => checkbox.checked);
        }
    }
    
    checkChargingPort();
});
