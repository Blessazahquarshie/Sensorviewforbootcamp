"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { SensorReading } from "@/lib/types"
import { format } from 'date-fns'
  
interface SensorDataTableProps {
    data: SensorReading[];
}
  
export function SensorDataTable({ data }: SensorDataTableProps) {
    return (
      <ScrollArea className="h-96 w-full rounded-md border">
        <Table>
          <TableHeader className="sticky top-0 bg-card z-10">
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead className="text-right">Temperature (°C)</TableHead>
              <TableHead className="text-right">Humidity (%)</TableHead>
              <TableHead className="text-right">Soil Moisture (%)</TableHead>
              <TableHead className="text-right">Soil Moisture (Raw)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.slice().reverse().map((reading) => (
                <TableRow key={reading.id}>
                  <TableCell>{format(new Date(reading.datetime), 'PPpp')}</TableCell>
                  <TableCell className="text-right">{reading.temperature.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{reading.humidity.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{reading.soil_moisture_percent.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{reading.soil_moisture_raw}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No data available for the selected range.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    )
  }
