
'use client';

import { File, PlusCircle, Menu, Search, ShoppingCart, History, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
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
import { Label } from '@/components/ui/label';
import React, { useState, useMemo, useEffect, useCallback, memo } from 'react';
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

const initialNewCustomerState = {
    name: '',
    mobile: '',
    address: '',
    age: '',
    gender: null as 'Male' | 'Female' | 'Other' | null,
};


const CustomersPage = () => {
    const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', []);
    const [searchQuery, setSearchQuery] = useState('');
    const [dialogState, setDialogState] = useState<'add' | 'edit' | 'view' | 'closed'>('closed');
    const [deleteConfirmState, setDeleteConfirmState] = useState<Customer | null>(null);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [customerFormData, setCustomerFormData] = useState(initialNewCustomerState);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const filteredCustomers = useMemo(() => {
        if (!isClient) return [];
        if (!searchQuery) return customers;
        return customers.filter(customer => 
            customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            customer.mobile.includes(searchQuery)
        );
    }, [searchQuery, customers, isClient]);

    const openDialog = (mode: 'add' | 'edit' | 'view', customer?: Customer) => {
        setSelectedCustomer(customer || null);
        if (mode === 'add') {
            setCustomerFormData(initialNewCustomerState);
        } else if (customer) {
            setCustomerFormData({
                name: customer.name,
                mobile: customer.mobile,
                address: customer.address,
                age: customer.age ? String(customer.age) : '',
                gender: customer.gender
            })
        }
        setDialogState(mode);
    };

    const closeDialog = () => {
        setDialogState('closed');
        setSelectedCustomer(null);
    }

    const handleFormSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        if (customerFormData.name && customerFormData.mobile) {
            const newCustomerData = {
                ...customerFormData,
                id: dialogState === 'edit' && selectedCustomer ? selectedCustomer.id : Date.now(),
                age: customerFormData.age ? parseInt(customerFormData.age) : null,
                prescriptions: dialogState === 'edit' && selectedCustomer ? selectedCustomer.prescriptions : 0,
            };

            if (dialogState === 'edit') {
                setCustomers(prev => prev.map(c => c.id === newCustomerData.id ? newCustomerData : c));
            } else {
                 setCustomers(prev => [...prev, newCustomerData]);
            }

            closeDialog();
        }
      }, [customerFormData, setCustomers, dialogState, selectedCustomer]);
    
    const handleDeleteCustomer = () => {
        if(deleteConfirmState) {
            setCustomers(prev => prev.filter(c => c.id !== deleteConfirmState.id));
            setDeleteConfirmState(null);
        }
    }

  return (
    <>
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
                <Button size="sm" className="h-8 gap-1" onClick={() => openDialog('add')}>
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
              <TableHead>Age</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Address</TableHead>
               <TableHead>Prescriptions</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isClient && filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                    <TableCell className="font-medium">{customer.name}</TableCell>
                    <TableCell>{customer.mobile}</TableCell>
                    <TableCell>{customer.age}</TableCell>
                    <TableCell>{customer.gender}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{customer.address}</TableCell>
                    <TableCell>{customer.prescriptions}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline" className="h-8 gap-1">
                            <Link href={`/billing?customerId=${customer.id}`}>
                                <ShoppingCart className="h-3.5 w-3.5" />
                                <span className="sr-only sm:not-sr-only">Bill</span>
                            </Link>
                        </Button>
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
                            <DropdownMenuItem onSelect={() => openDialog('view', customer)}>View Details</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => openDialog('edit', customer)}>Edit</DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => setDeleteConfirmState(customer)} className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                </TableRow>
                ))
            ) : (
                <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">{isClient ? 'No customers found.' : 'Loading customers...'}</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <Dialog open={dialogState !== 'closed'} onOpenChange={(isOpen) => !isOpen && closeDialog()}>
      <DialogContent>
            <form onSubmit={handleFormSubmit}>
            <DialogHeader>
                <DialogTitle>{dialogState === 'add' ? 'Add New Customer' : dialogState === 'edit' ? 'Edit Customer' : 'Customer Details'}</DialogTitle>
                <DialogDescription>
                {dialogState === 'add' ? 'Enter the details of the new customer.' : dialogState === 'edit' ? 'Update the customer\'s details.' : `Viewing details for ${selectedCustomer?.name}.`}
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        value={customerFormData.name}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, name: e.target.value })}
                        required
                        disabled={dialogState === 'view'}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile</Label>
                    <Input
                        id="mobile"
                        value={customerFormData.mobile}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, mobile: e.target.value })}
                        required
                        disabled={dialogState === 'view'}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                            id="age"
                            type="number"
                            value={customerFormData.age}
                            onChange={(e) => setCustomerFormData({ ...customerFormData, age: e.target.value })}
                            disabled={dialogState === 'view'}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Select
                            onValueChange={(value: 'Male' | 'Female' | 'Other') => setCustomerFormData({ ...customerFormData, gender: value })}
                            value={customerFormData.gender ?? ''}
                            disabled={dialogState === 'view'}
                        >
                            <SelectTrigger id="gender">
                                <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                        id="address"
                        value={customerFormData.address}
                        onChange={(e) => setCustomerFormData({ ...customerFormData, address: e.target.value })}
                        disabled={dialogState === 'view'}
                    />
                </div>
            </div>
            {dialogState !== 'view' && (
                <DialogFooter>
                    <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
                    <Button type="submit">Save Customer</Button>
                </DialogFooter>
            )}
            </form>
        </DialogContent>
    </Dialog>

    <AlertDialog open={!!deleteConfirmState} onOpenChange={(isOpen) => !isOpen && setDeleteConfirmState(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the customer record for {deleteConfirmState?.name}.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCustomer}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    </>
  );
}

export default memo(CustomersPage);

    