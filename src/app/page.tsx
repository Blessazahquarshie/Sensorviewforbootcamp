"use client";

import { useState, useEffect, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";
import { AlertCircle, Download, Loader, Thermometer, Droplets, Leaf, Clock, Wifi, WifiOff, LayoutDashboard } from "lucide-react";

import type { SensorReading, ConnectionStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePickerWithRange } from "@/components/dashboard/date-range-picker";
import { SensorDataTable } from "@/components/dashboard/sensor-data-table";
import { SoilMoistureChart } from "@/components/dashboard/soil-moisture-chart";
import { TempHumidityChart } from "@/components/dashboard/temp-humidity-chart";
import { exportToCsv } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const POLLING_INTERVAL = 5000; // 5 seconds
const FIREBASE_URL = "https://sensorview-13b88-default-rtdb.europe-west1.firebasedatabase.app/sensors.json";

export default function DashboardPage() {
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("connecting");
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    const fetchData = async () => {
      setConnectionStatus((prevStatus) => (prevStatus === 'disconnected' ? 'connecting' : prevStatus));
      try {
        const response = await fetch(FIREBASE_URL);
        if (!response.ok) {
          throw new Error(`Failed to fetch data (Status: ${response.status}). Ensure the database URL is correct and public read access is allowed.`);
        }
        const data = await response.json();
        
        const formattedData: SensorReading[] = data 
          ? Object.keys(data).map((key) => ({
              id: key,
              ...data[key],
              datetime: data[key].datetime,
            })).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
          : [];
        
        setSensorData(formattedData);
        setConnectionStatus("connected");
        setError(null);
      } catch (err) {
        setConnectionStatus("error");
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching data.");
        // Stop polling on error to avoid repeated failed requests
        clearInterval(intervalId);
      }
    };
    
    fetchData(); // Initial fetch
    const intervalId = setInterval(fetchData, POLLING_INTERVAL);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  const filteredData = useMemo(() => {
    if (!dateRange || !dateRange.from) {
      return sensorData;
    }
    const endOfDay = dateRange.to ? new Date(dateRange.to) : new Date(dateRange.from);
    endOfDay.setHours(23, 59, 59, 999);

    return sensorData.filter((reading) =>
      isWithinInterval(new Date(reading.datetime), { start: dateRange.from!, end: endOfDay })
    );
  }, [sensorData, dateRange]);

  const latestReading = useMemo(() => filteredData[filteredData.length - 1], [filteredData]);

  const handleExport = () => {
    exportToCsv(filteredData, "sensor_data");
  };

  const StatusIndicator = () => {
    switch (connectionStatus) {
      case "connected":
        return <div className="flex items-center gap-2 text-primary"><Wifi size={16} /> Connected</div>;
      case "connecting":
        return <div className="flex items-center gap-2 text-blue-500"><Loader size={16} className="animate-spin" /> Connecting...</div>;
      case "error":
        return <div className="flex items-center gap-2 text-destructive"><AlertCircle size={16} /> Error</div>;
      default:
        return <div className="flex items-center gap-2 text-muted-foreground"><WifiOff size={16} /> Disconnected</div>;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-sm shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-7 w-7 text-primary" />
              <h1 className="text-2xl font-bold font-headline text-foreground">SensorView</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-sm font-medium p-2 rounded-md bg-background"><StatusIndicator /></div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
              <Button onClick={handleExport} variant="outline" disabled={filteredData.length === 0}>
                <Download size={16} className="mr-2" />
                Export to CSV
              </Button>
            </div>
        </div>
        
        {connectionStatus === "error" && error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {connectionStatus === 'connecting' || (connectionStatus === 'connected' && sensorData.length === 0 && !error) ? (
          <div className="pt-16">
            <Card className="w-full max-w-lg mx-auto bg-card/70">
              <CardHeader>
                <CardTitle className="text-center">
                  {connectionStatus === 'connecting' ? 'Fetching Sensor Data...' : 'Awaiting Data'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center text-center space-y-4 p-8">
                {connectionStatus === 'connecting' ? (
                  <Loader size={48} className="animate-spin text-primary" />
                ) : (
                  <Wifi size={48} className="text-primary" />
                )}
                <p className="text-muted-foreground">
                  {connectionStatus === 'connecting' 
                    ? `Attempting to connect to the sensor database.`
                    : `Successfully connected, but no data was found. Please ensure your device is sending data.`}
                </p>
              </CardContent>
            </Card>
          </div>
        ) : (
          !error && (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard icon={<Thermometer />} title="Temperature" value={`${latestReading?.temperature.toFixed(1) ?? 'N/A'}°C`} />
                <StatCard icon={<Droplets />} title="Humidity" value={`${latestReading?.humidity.toFixed(1) ?? 'N/A'}%`} />
                <StatCard icon={<Leaf />} title="Soil Moisture" value={`${latestReading?.soil_moisture_percent.toFixed(1) ?? 'N/A'}%`} />
                <StatCard icon={<Clock />} title="Last Update" value={latestReading ? new Date(latestReading.datetime).toLocaleTimeString() : 'N/A'} />
              </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Temperature & Humidity</CardTitle>
                    <CardDescription>Real-time sensor readings for temperature and humidity.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <TempHumidityChart data={filteredData} />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Soil Moisture (%)</CardTitle>
                    <CardDescription>Real-time sensor readings for soil moisture percentage.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SoilMoistureChart data={filteredData} />
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>All Sensor Readings</CardTitle>
                  <CardDescription>A comprehensive log of all sensor data within the selected time frame.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SensorDataTable data={filteredData} />
                </CardContent>
              </Card>
            </>
          )
        )}
      </main>
    </div>
  );
}

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);
