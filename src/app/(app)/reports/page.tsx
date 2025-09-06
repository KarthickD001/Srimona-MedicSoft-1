
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, YAxis, Legend } from 'recharts';
import { Button } from '@/components/ui/button';
import { File } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const salesData: any[] = [];
const salesChartConfig = { sales: { label: 'Sales', color: 'hsl(var(--chart-1))' } };

const profitData: any[] = [];
const profitChartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
  expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
};

const topSellingData: any[] = [];
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function ReportsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Reports & Analytics</h1>
        <Button size="sm" variant="outline" className="h-8 gap-1">
          <File className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Export All
          </span>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Sales</CardTitle>
            <CardDescription>A summary of sales over the past 6 months.</CardDescription>
          </CardHeader>
          <CardContent>
            {salesData.length > 0 ? (
                <ChartContainer config={salesChartConfig} className="h-[250px] w-full">
                    <BarChart data={salesData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />} />
                        <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
                    </BarChart>
                </ChartContainer>
            ) : (
                <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
                    No sales data to display.
                </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profit & Loss</CardTitle>
            <CardDescription>Revenue vs Expenses for the last 3 months.</CardDescription>
          </CardHeader>
          <CardContent>
             {profitData.length > 0 ? (
                <ChartContainer config={profitChartConfig} className="h-[250px] w-full">
                    <BarChart data={profitData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} />
                        <YAxis tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                        <ChartTooltip content={<ChartTooltipContent formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />} />
                        <Legend />
                        <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
                        <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
                    </BarChart>
                </ChartContainer>
            ) : (
                <div className="h-[250px] w-full flex items-center justify-center text-muted-foreground">
                    No profit data to display.
                </div>
            )}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Medicines</CardTitle>
          <CardDescription>Medicines with the highest sales volume.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brand Name</TableHead>
                <TableHead>Units Sold</TableHead>
                <TableHead>Total Revenue (₹)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topSellingData.length > 0 ? (
                topSellingData.map(item => (
                    <TableRow key={item.name}>
                        <TableCell className='font-medium'>{item.name}</TableCell>
                        <TableCell>{item.unitsSold.toLocaleString('en-IN')}</TableCell>
                        <TableCell>{item.totalRevenue.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                    No data available.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
