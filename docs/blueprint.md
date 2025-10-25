# **App Name**: SensorView Dashboard

## Core Features:

- Firebase Configuration: Input fields for Firebase Project ID and a connect button to establish a connection with a connection status indicator.
- Real-time Data Fetch: Continuously fetch sensor data from Firebase Realtime Database using the REST API and monitor and display database updates on the UI.
- Soil Moisture Chart: Display a real-time line chart visualizing soil moisture percentage over time, updated with the latest readings.
- Temperature and Humidity Chart: Display a real-time line chart visualizing temperature and humidity over time using a dual Y-axis, updated with the latest readings.
- Data Table Display: Show all sensor readings in a scrollable table with columns for datetime, temperature, humidity, soil_moisture_percent, and soil_moisture_raw.
- Data Export: Implement an "Export to CSV" button to download all Firebase data as a CSV file. The file name is sensor_data_YYYYMMDD_HHMMSS.csv.
- Date Range Filter: Implement a date range filter to view specific time periods and filter all dashboard data views and visualizations by this filter.

## Style Guidelines:

- Primary color: Amber (#FFDA63) to create a professional, clean look that contrasts well with data visualizations.
- Background color: Light Blue (#B0E2FF) for a neutral, clean background that supports data visualization readability.
- Accent color: Crimson (#E23A61) to highlight interactive elements and important data points, providing visual contrast.
- Body and headline font: 'Inter' sans-serif, for both headlines and body, for a modern, machined look
- Use minimalistic, line-style icons for clear visual communication.  Icons should support quick recognition of dashboard functions.
- Employ a card-based layout with CSS Grid/Flexbox for responsiveness. Arrange stat cards at the top, charts in the middle, and the data table below. Ensure smooth transitions for a seamless user experience. Octagonal cards.
- Use subtle animations for loading indicators and data updates. This provides feedback to the user and enhances the perceived performance of the dashboard.