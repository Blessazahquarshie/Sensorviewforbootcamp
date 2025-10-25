"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { format, isValid } from 'date-fns'
import type { SensorReading } from "@/lib/types"

interface SoilMoistureChartProps {
  data: SensorReading[]
}

export function SoilMoistureChart({ data }: SoilMoistureChartProps) {
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
                <YAxis 
                    label={{ value: 'Moisture (%)', angle: -90, position: 'insideLeft', fill: 'hsl(var(--foreground))', style: {textAnchor: 'middle'} }}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
                    labelFormatter={(label) => {
                        const date = new Date(label);
                        return isValid(date) ? format(date, 'PPpp') : '';
                    }}
                    formatter={(value) => [`${(value as number).toFixed(1)}%`, 'Soil Moisture']}
                />
                <Legend />
                <Line type="monotone" dataKey="soil_moisture_percent" name="Soil Moisture" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} />
            </LineChart>
        </ResponsiveContainer>
    </div>
  )
}
