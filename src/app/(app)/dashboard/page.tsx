
'use client';

import {
  Activity,
  ArrowUpRight,
  CircleUser,
  CreditCard,
  IndianRupee,
  Menu,
  Package2,
  Search,
  Users,
  Bell,
  TriangleAlert,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useMemo, useState, useEffect } from 'react';
import { subMonths, format, startOfMonth, endOfMonth, isWithinInterval, parse } from 'date-fns';

interface RecentSale {
    invoiceId: string;
    customer: string;
    date: string; // DD/MM/YYYY
    total: number;
    status: 'Completed' | 'Pending' | 'Draft';
    items: any[];
}

interface Customer {
    id: number;
    name: string;
    mobile: string;
    address: string;
    age: number | null;
    gender: 'Male' | 'Female' | 'Other' | null;
    prescriptions: number;
}
  
interface Medicine {
    id: number;
    brandName: string;
    genericName: string;
    strength: string;
    form: string;
    hsn: string;
    stock: number;
    mrp: number;
    expiryDate: string; // YYYY-MM-DD
    batchNo: string;
    gst: number;
}

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
};

export default function DashboardPage() {
    const [recentSales] = useLocalStorage<RecentSale[]>('recentSales', []);
    const [customers] = useLocalStorage<Customer[]>('customers', []);
    const [medicines] = useLocalStorage<Medicine[]>('medicines', []);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const lastMonthSales = useMemo(() => {
        if (!isClient) return [];
        const lastMonth = subMonths(new Date(), 1);
        const start = startOfMonth(lastMonth);
        const end = endOfMonth(lastMonth);
        return recentSales.filter(sale => {
            try {
                const saleDate = parse(sale.date, 'dd/MM/yyyy', new Date());
                return isWithinInterval(saleDate, { start, end });
            } catch (e) {
                return false;
            }
        });
    }, [recentSales, isClient]);

    const totalRevenue = useMemo(() => {
        if (!isClient) return 0;
        return recentSales.reduce((sum, sale) => sum + sale.total, 0);
    }, [recentSales, isClient]);

    const totalRevenueLastMonth = useMemo(() => {
        if (!isClient) return 0;
        return lastMonthSales.reduce((sum, sale) => sum + sale.total, 0)
    }, [lastMonthSales, isClient]);
    
    const newCustomersLastMonth = useMemo(() => {
        if (!isClient) return 0;
        // This is a placeholder logic. In a real app, customer creation date would be stored.
        return customers.length > 5 ? Math.floor(customers.length / 5) : 0;
    }, [customers, isClient]);

    const prescriptionsFilled = useMemo(() => {
        if (!isClient) return 0;
        return recentSales.reduce((acc, sale) => acc + sale.items.length, 0);
    }, [recentSales, isClient]);
    
    const alerts = useMemo(() => {
        if (!isClient) return [];
        const today = new Date();
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(today.getDate() + 60);

        return medicines.map(med => {
            const expiryDate = new Date(med.expiryDate);
            if (expiryDate < today) {
                return { medicine: med.brandName, type: 'Expired', details: `Expired on ${expiryDate.toLocaleDateString()}` };
            }
            if (expiryDate <= sixtyDaysFromNow) {
                 return { medicine: med.brandName, type: 'Near Expiry', details: `Expires on ${expiryDate.toLocaleDateString()}` };
            }
            if (med.stock > 0 && med.stock < 10) {
                return { medicine: med.brandName, type: 'Low Stock', details: `Only ${med.stock} units left` };
            }
            if (med.stock === 0) {
                 return { medicine: med.brandName, type: 'Out of Stock', details: 'No units available' };
            }
            return null;
        }).filter(Boolean);
    }, [medicines, isClient]);
    
    const chartData = useMemo(() => {
        if (!isClient) return [];
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
    }, [recentSales, isClient]);

    const getAlertTypeClass = (type: string) => {
        switch (type) {
            case 'Low Stock': return 'text-orange-500';
            case 'Near Expiry': return 'text-yellow-500';
            case 'Expired': return 'text-red-500 font-bold';
            case 'Out of Stock': return 'text-red-600 font-bold';
            default: return '';
        }
    };


  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{isClient ? totalRevenue.toLocaleString('en-IN') : '...'}</div>
            <p className="text-xs text-muted-foreground">
              {isClient ? (totalRevenueLastMonth > 0 ? `+₹${totalRevenueLastMonth.toLocaleString('en-IN')} from last month` : 'No sales data from last month') : '...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              New Customers
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isClient ? `+${Math.max(0, customers.length - 1)}` : '...'}</div>
            <p className="text-xs text-muted-foreground">
              {isClient ? (newCustomersLastMonth > 0 ? `+${newCustomersLastMonth} since last month` : 'No new customers last month') : '...'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescriptions Filled</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{isClient ? prescriptionsFilled : '...'}</div>
            <p className="text-xs text-muted-foreground">
              Total items sold across all bills
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isClient ? alerts.length : '...'}</div>
            <p className="text-xs text-muted-foreground">
                {isClient ? (alerts.length > 0 ? 'Check inventory for details' : 'No active alerts') : '...'}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>
              A summary of your sales performance over the past 6 months.
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
             {isClient && chartData.some(d => d.sales > 0) ? (
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <BarChart accessibilityLayer data={chartData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />}
                    />
                    <Bar dataKey="sales" fill="var(--color-sales)" radius={8} />
                </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[300px] w-full items-center justify-center text-muted-foreground">
                  {isClient ? 'No sales data available.' : 'Loading sales data...'}
                </div>
              )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Alerts & Notifications</CardTitle>
            <CardDescription>
              Critical inventory and expiry alerts.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medicine</TableHead>
                  <TableHead>Alert Type</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isClient && alerts.length > 0 ? (
                    alerts.slice(0, 5).map((alert, index) => (
                        <TableRow key={index} className={getAlertTypeClass(alert.type)}>
                            <TableCell>{alert.medicine}</TableCell>
                            <TableCell>{alert.type}</TableCell>
                            <TableCell>{alert.details}</TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={3} className="h-24 text-center">{isClient ? 'No alerts' : 'Loading alerts...'}</TableCell>
                    </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    

    