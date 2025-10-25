"use client";

import { useState, useEffect, useMemo } from "react";
import type { DateRange } from "react-day-picker";
import { isWithinInterval } from "date-fns";
import { AlertCircle, Download, Loader, Thermometer, Droplets, Leaf, Clock, Wifi, WifiOff, LayoutDashboard } from "lucide-react";

import type { SensorReading, ConnectionStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DatePickerWithRange } from "@/components/dashboard/date-range-picker";
import { SensorDataTable } from "@/components/dashboard/sensor-data-table";
import { SoilMoistureChart } from "@/components/dashboard/soil-moisture-chart";
import { TempHumidityChart } from "@/components/dashboard/temp-humidity-chart";
import { exportToCsv } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const POLLING_INTERVAL = 5000; // 5 seconds

export default function DashboardPage() {
  const [projectId, setProjectId] = useState("");
  const [inputProjectId, setInputProjectId] = useState("");
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>("disconnected");
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  useEffect(() => {
    if (!projectId) {
      setConnectionStatus("disconnected");
      return;
    }

    let intervalId: NodeJS.Timeout;

    const fetchData = async () => {
      if (connectionStatus === 'error') return;

      setConnectionStatus("connecting");
      try {
        const response = await fetch(`https://${projectId}.firebaseio.com/sensors.json`);
        if (!response.ok) {
          throw new Error(`Failed to fetch data (Status: ${response.status}). Ensure project ID is correct and database rules allow public read access to '/sensors'.`);
        }
        const data = await response.json();
        
        if (data) {
          const formattedData: SensorReading[] = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
            datetime: data[key].datetime,
          })).sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());
          
          setSensorData(formattedData);
          setConnectionStatus("connected");
          setError(null);
        } else {
            setSensorData([]);
            setConnectionStatus("connected");
        }
      } catch (err) {
        setConnectionStatus("error");
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        if(intervalId) clearInterval(intervalId);
      }
    };
    
    fetchData();
    intervalId = setInterval(fetchData, POLLING_INTERVAL);

    return () => clearInterval(intervalId);
  }, [projectId]);

  const handleConnect = () => {
    if (inputProjectId) {
      setSensorData([]);
      setDateRange(undefined);
      setError(null);
      setProjectId(inputProjectId);
    }
  };
  
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
        return <div className="flex items-center gap-2 text-green-700"><Wifi size={16} /> Connected</div>;
      case "connecting":
        return <div className="flex items-center gap-2 text-blue-700"><Loader size={16} className="animate-spin" /> Connecting...</div>;
      case "error":
        return <div className="flex items-center gap-2 text-destructive"><AlertCircle size={16} /> Error</div>;
      default:
        return <div className="flex items-center gap-2 text-muted-foreground"><WifiOff size={16} /> Disconnected</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-10 bg-gradient-to-r from-primary via-accent to-card text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="h-7 w-7" />
              <h1 className="text-2xl font-bold font-headline text-foreground">SensorView Dashboard</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-48">
                <Input
                  type="text"
                  placeholder="Firebase Project ID"
                  value={inputProjectId}
                  onChange={(e) => setInputProjectId(e.target.value)}
                  className="bg-background/20 placeholder:text-primary-foreground/70 border-primary-foreground/50 focus-visible:ring-offset-primary"
                />
              </div>
              <Button onClick={handleConnect} disabled={connectionStatus === 'connecting' || !inputProjectId} variant="secondary">
                {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
              </Button>
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
            <div className="text-sm font-medium p-2 rounded-md bg-card/70"><StatusIndicator /></div>
        </div>
        
        {connectionStatus === "error" && error && (
            <Alert variant="destructive" className="clip-octagon">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Connection Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {projectId && (connectionStatus === 'connecting' || (connectionStatus === 'connected' && sensorData.length === 0)) && (
          <div className="pt-16">
            <Card className="clip-octagon w-full max-w-lg mx-auto">
              <CardHeader>
                <CardTitle className="text-center">
                  {connectionStatus === 'connecting' ? 'Fetching Sensor Data...' : 'Awaiting Data'}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center text-center space-y-4 p-8">
                {connectionStatus === 'connecting' ? (
                  <Loader size={48} className="animate-spin text-primary" />
                ) : (
                  <Wifi size={48} className="text-green-600" />
                )}
                <p className="text-muted-foreground">
                  {connectionStatus === 'connecting' 
                    ? `Attempting to connect to Firebase project '${projectId}'.`
                    : `Successfully connected to '${projectId}', but no data was found at the '/sensors' path. Please ensure your device is sending data.`}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {filteredData.length > 0 && (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<Thermometer />} title="Temperature" value={`${latestReading?.temperature.toFixed(1) ?? 'N/A'}°C`} />
              <StatCard icon={<Droplets />} title="Humidity" value={`${latestReading?.humidity.toFixed(1) ?? 'N/A'}%`} />
              <StatCard icon={<Leaf />} title="Soil Moisture" value={`${latestReading?.soil_moisture_percent.toFixed(1) ?? 'N/A'}%`} />
              <StatCard icon={<Clock />} title="Last Update" value={latestReading ? new Date(latestReading.datetime).toLocaleTimeString() : 'N/A'} />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="clip-octagon">
                <CardHeader>
                  <CardTitle>Temperature & Humidity</CardTitle>
                  <CardDescription>Real-time sensor readings for temperature and humidity.</CardDescription>
                </CardHeader>
                <CardContent>
                  <TempHumidityChart data={filteredData} />
                </CardContent>
              </Card>
              <Card className="clip-octagon">
                <CardHeader>
                  <CardTitle>Soil Moisture (%)</CardTitle>
                  <CardDescription>Real-time sensor readings for soil moisture percentage.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SoilMoistureChart data={filteredData} />
                </CardContent>
              </Card>
            </div>

            <Card className="clip-octagon">
              <CardHeader>
                <CardTitle>All Sensor Readings</CardTitle>
                <CardDescription>A comprehensive log of all sensor data within the selected time frame.</CardDescription>
              </CardHeader>
              <CardContent>
                <SensorDataTable data={filteredData} />
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}

const StatCard = ({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) => (
  <Card className="clip-octagon">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className="text-muted-foreground">{icon}</div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);
