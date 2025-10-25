"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format } from 'date-fns'
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
                tickFormatter={(time) => format(new Date(time), 'HH:mm')}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
            />
            <YAxis yAxisId="left" stroke="#8884d8" label={{ value: 'Temp (°C)', angle: -90, position: 'insideLeft', fill: '#8884d8', style: {textAnchor: 'middle'} }} fontSize={12} tickLine={false} axisLine={false} />
            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Humidity (%)', angle: -90, position: 'insideRight', fill: '#82ca9d', style: {textAnchor: 'middle'} }} fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                labelFormatter={(label) => format(new Date(label), 'PPpp')}
                formatter={(value, name) => [`${(value as number).toFixed(1)} ${name === 'temperature' ? '°C' : '%'}`, name.charAt(0).toUpperCase() + name.slice(1)]}
            />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="temperature" stroke="#8884d8" strokeWidth={2} dot={false} />
            <Line yAxisId="right" type="monotone" dataKey="humidity" stroke="#82ca9d" strokeWidth={2} dot={false} />
        </LineChart>
        </ResponsiveContainer>
    </div>
  )
}
