
'use client';

import { File, PlusCircle, Menu, Search, ShoppingCart, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { Input } from '@/components/ui/input';
import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';

interface Customer {
    id: number;
    name: string;
    mobile: string;
    address: string;
    age: number | null;
    gender: 'Male' | 'Female' | 'Other' | null;
    prescriptions: number;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;
        return customers.filter(customer => 
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.mobile.includes(searchQuery)
        );
    }, [searchQuery, customers]);

    if (!isMounted) {
        return null; // or a loading skeleton
    }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div>
                <CardTitle>Customers</CardTitle>
                <CardDescription>
                Manage your customer database.
                </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-grow justify-end">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search by name or mobile..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button size="sm" className="h-8 gap-1">
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Customer
                    </span>
                </Button>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                    <File className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Export
                    </span>
                </Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile</TableHead>
              <TableHead className="hidden md:table-cell">Age</TableHead>
              <TableHead className="hidden md:table-cell">Gender</TableHead>
              <TableHead>Address</TableHead>
               <TableHead>Prescriptions</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCustomers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">No customers found.</TableCell>
                </TableRow>
            ) : (
                filteredCustomers.map((customer) => (
                <TableRow key={customer.mobile}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.age}</TableCell>
                    <TableCell className="hidden md:table-cell">{customer.gender}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{customer.address}</TableCell>
                    <TableCell>{customer.prescriptions}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Link href={`/billing?customerId=${customer.id}`}>
                            <Button size="sm" variant="outline" className="h-8 gap-1">
                                <ShoppingCart className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only">Bill</span>
                            </Button>
                        </Link>
                        <Button size="sm" variant="outline" className="h-8 gap-1">
                            <History className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only">History</span>
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                            <Button aria-haspopup="true" size="icon" variant="ghost">
                                <Menu className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
