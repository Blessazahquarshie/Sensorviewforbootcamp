export type SensorReading = {
  id: string;
  datetime: string;
  temperature: number;
  humidity: number;
  soil_moisture_percent: number;
  soil_moisture_raw: number;
};

export type ConnectionStatus = "disconnected" | "connecting" | "connected" | "error";
