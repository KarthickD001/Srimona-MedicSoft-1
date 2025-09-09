
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
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMemo } from 'react';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval, parse } from 'date-fns';

interface BillItem {
  id: number;
  name: string;
  batch: string;
  expiry: string;
  qty: number;
  mrp: number;
  discount: number;
  gst: number;
}

interface RecentSale {
  invoiceId: string;
  customer: string;
  date: string; // DD/MM/YYYY
  total: number;
  status: 'Completed' | 'Pending' | 'Draft';
  items: BillItem[];
}

const salesChartConfig = { sales: { label: 'Sales', color: 'hsl(var(--chart-1))' } };
const profitChartConfig = {
  revenue: { label: 'Revenue', color: 'hsl(var(--chart-1))' },
  expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
};
const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

export default function ReportsPage() {
  const [recentSales] = useLocalStorage<RecentSale[]>('recentSales', []);

  const salesData = useMemo(() => {
    const data: {month: string; sales: number}[] = [];
    for (let i = 5; i >= 0; i--) {
        const monthDate = subMonths(new Date(), i);
        const monthName = format(monthDate, 'MMM');
        
        const start = startOfMonth(monthDate);
        const end = endOfMonth(monthDate);

        const monthSales = recentSales
            .filter(sale => {
                try {
                    const saleDate = parse(sale.date, 'dd/MM/yyyy', new Date());
                    return isWithinInterval(saleDate, { start, end });
                } catch (e) {
                    return false;
                }
            })
            .reduce((sum, sale) => sum + sale.total, 0);
        
        data.push({ month: monthName, sales: monthSales });
    }
    return data;
  }, [recentSales]);

  const profitData = useMemo(() => {
      // Assuming cost is 70% of revenue for demonstration
      return salesData.slice(-3).map(d => ({
          month: d.month,
          revenue: d.sales,
          expenses: d.sales * 0.7,
      }));
  }, [salesData]);

  const topSellingData = useMemo(() => {
    const medicineSales: { [key: string]: { unitsSold: number, totalRevenue: number } } = {};

    recentSales.forEach(sale => {
        sale.items.forEach(item => {
            if (!medicineSales[item.name]) {
                medicineSales[item.name] = { unitsSold: 0, totalRevenue: 0 };
            }
            medicineSales[item.name].unitsSold += item.qty;
            medicineSales[item.name].totalRevenue += item.qty * item.mrp * (1 - item.discount / 100);
        });
    });
    
    return Object.entries(medicineSales)
        .map(([name, data]) => ({ name, ...data }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 10); // Top 10
  }, [recentSales]);


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
            {salesData.some(d => d.sales > 0) ? (
                <ChartContainer config={salesChartConfig} className="h-[250px] w-full">
                    <BarChart data={salesData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
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
             {profitData.some(d => d.revenue > 0) ? (
                <ChartContainer config={profitChartConfig} className="h-[250px] w-full">
                    <BarChart data={profitData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
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
                        <TableCell>₹{item.totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</TableCell>
                    </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                    No sales data available to calculate top selling products.
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
