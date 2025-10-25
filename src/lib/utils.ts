import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function exportToCsv<T extends object>(data: T[], baseFilename: string) {
  if (data.length === 0) {
    console.warn("No data to export.");
    return;
  }

  const timestamp = format(new Date(), "yyyyMMdd_HHmmss");
  const filename = `${baseFilename}_${timestamp}.csv`;

  const headers = Object.keys(data[0]);
  const replacer = (key: string, value: any) => value === null ? '' : value;
  
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(fieldName => {
            const value = row[fieldName as keyof T];
            // Stringify to handle commas and quotes in data
            let stringifiedValue = JSON.stringify(value, replacer);
            // Remove quotes from numbers
            if (typeof value === 'number') {
                stringifiedValue = value.toString();
            }
            return stringifiedValue;
        })
        .join(',')
    ),
  ];
  
  const csvString = csvRows.join('\r\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
