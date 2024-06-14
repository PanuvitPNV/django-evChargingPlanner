> [!IMPORTANT]
> **Notice of Discontinuation**: We are discontinuing the use of jQuery in favor of Vue.js. This change is aimed at improving the maintainability and performance of our codebase. Please ensure that all new development and any updates to existing features use Vue.js going forward. If you have any questions or need assistance with this transition, contact the development team.


# EV Charging Planner

**EV Charging Planner** is a web application designed to help users efficiently plan their electric vehicle (EV) charging schedule. Whether you're managing routes for personal electric vehicles or planning your own charging routine, this tool can assist you in optimizing your charging routines to minimize costs and maximize convenience.

## Table of Contents

- [Features](#features)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- **Route Planning**: Plan routes for your electric vehicles, considering available charging stations along the way.
- **Charging Schedule Optimization**: Automatically generate optimal charging schedules based on user preferences and vehicle specifications.
- **Integration with Google Maps**: Seamlessly open routing directions in Google Maps for planned routes, providing users with navigation assistance.
- **Access Charging Station Information**: Users can view details about charging stations, including location and available charging ports, though real-time availability information may not be provided.
- **User-Friendly Interface**: Intuitive web interface for easy navigation and interaction.
- **Automatic Car Model Recognition**: Users can choose their car brand and model, and the application will autofill the car's battery capacity (kWh) and charging port details. Alternatively, users can manually select the battery capacity and charging port.
- **Customizable Battery Levels**: Users can choose the initial and arrival battery percentages to tailor charging schedules to their specific needs.

## Usage
This web application is designed to help EV (Electric Vehicle) owners plan their charging sessions effectively. Here's how you can use the application:

1. **Select Your EV:** Start by selecting your electric vehicle's brand and model from the provided list. If your vehicle is not listed, you can manually enter the details, including the make, model, and battery capacity.
2. **Set Battery Levels:** Specify the initial battery level (percentage or range) when starting your journey, as well as the desired arrival battery level at your destination.
3. **Choose Locations:** Select your origin and destination locations from the dropdown lists. The application will populate these lists with available options based on your geographical region or data sources.
4. **Search for Route and Charging Stops:** After providing the required information, click the "Search Direction" button. The application will calculate an optimal route, taking into account your vehicle's range, battery levels, and charging requirements. It will suggest charging stops along the way, if needed.
5. **Review Results:** Wait for the application to process your request and display the results. This will include the recommended route, charging stop locations (if applicable), and any other relevant information, such as estimated travel time and energy consumption.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests to help improve this project.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- This project was inspired by the growing need for efficient electric vehicle charging solutions.
- Special thanks to the Django community for providing robust tools for web development.
- Thanks to Vercel for providing a platform to deploy web applications.
- Thanks to ev-database.org for providing valuable electric vehicle data.
- Special gratitude to the Department of Computer Science and Department of Data Science, Faculty of Science, Chiang Mai University, for providing the opportunity to participate in this project.

