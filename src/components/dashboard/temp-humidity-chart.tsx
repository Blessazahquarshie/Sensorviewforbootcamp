"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format, isValid } from 'date-fns'
import type { SensorReading } from "@/lib/types"

interface TempHumidityChartProps {
  data: SensorReading[]
}

export function TempHumidityChart({ data }: TempHumidityChartProps) {
  if (data.length === 0) {
    return <div className="flex items-center justify-center h-[250px] text-muted-foreground">No data for selected period</div>;
  }

  return (
    <div className="h-[250px] w-full">
        <ResponsiveContainer>
        <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
                dataKey="datetime" 
                tickFormatter={(time) => {
                    const date = new Date(time);
                    return isValid(date) ? format(date, 'HH:mm') : '';
                }}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis yAxisId="left" stroke="hsl(var(--chart-4))" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--chart-4))', style: {textAnchor: 'middle'} }} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-1))" label={{ value: 'Humidity (%)', angle: -90, position: 'insideRight', fill: 'hsl(var(--chart-1))', style: {textAnchor: 'middle'} }} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                labelFormatter={(label) => {
                    const date = new Date(label);
                    return isValid(date) ? format(date, 'PPpp') : '';
                }}
                formatter={(value, name) => [`${(value as number).toFixed(1)} ${name === 'temperature' ? '°C' : '%'}`, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" name="Temperature" dataKey="temperature" stroke="hsl(var(--chart-4))" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" name="Humidity" dataKey="humidity" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
        </LineChart>
        </ResponsiveContainer>
    </div>
  )
}
