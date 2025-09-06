
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { PlusCircle, Trash2, UserPlus, Search } from 'lucide-react';
import { useState, useMemo, useEffect, useContext } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { SettingsContext } from '@/context/settings-context';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useSearchParams } from 'next/navigation';

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
  date: string;
  total: number;
  status: 'Completed' | 'Pending' | 'Draft';
}

interface Medicine {
    id: number;
    name: string;
    batch: string;
    expiry: string;
    mrp: number;
    stock: number;
    gst: number;
}

interface Customer {
    id: number;
    name: string;
    mobile: string;
    address: string;
    age: number | null;
}

const availableMedicines: Medicine[] = [];

const initialItems: BillItem[] = [{ id: 1, name: '', batch: '', expiry: '', qty: 1, mrp: 0, discount: 0, gst: 0 }];

export default function BillingPage() {
  const [items, setItems] = useState<BillItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [addQty, setAddQty] = useState(1);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', [{id: 1, name: 'Walk-in Customer', mobile: '9999999999', address: '', age: null}]);
  const [recentSales, setRecentSales] = useLocalStorage<RecentSale[]>('recentSales', []);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(customers[0]);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({name: '', mobile: '', address: '', age: ''});
  const [isAddCustomerDialogOpen, setIsAddCustomerDialogOpen] = useState(false);
  const [recentSalesSearchQuery, setRecentSalesSearchQuery] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const { settings } = useContext(SettingsContext);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Generate a unique invoice number on component mount
    setInvoiceNumber(`JA-2425-${String(recentSales.length + 1).padStart(4, '0')}`);
  }, [items, recentSales.length]);

  useEffect(() => {
    const customerId = searchParams.get('customerId');
    if (customerId) {
      const customer = customers.find(c => c.id === parseInt(customerId));
      if (customer) {
        setSelectedCustomer(customer);
      }
    }
  }, [searchParams, customers]);


  const calculateItemTotal = (item: BillItem) => {
    const discountedPrice = item.mrp * (1 - item.discount / 100);
    const gstAmount = discountedPrice * (item.gst / 100);
    const total = discountedPrice + gstAmount;
    return total * item.qty;
  };
  
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + (item.mrp * item.qty), 0), [items]);
  const totalDiscount = useMemo(() => items.reduce((acc, item) => acc + (item.mrp * item.qty * (item.discount / 100)), 0), [items]);
  const totalGst = useMemo(() => items.reduce((acc, item) => {
      const discountedPrice = item.mrp * (1 - item.discount / 100);
      return acc + (discountedPrice * (item.gst / 100) * item.qty);
  }, 0), [items]);

  const finalTotal = subtotal - totalDiscount + totalGst;


  const handleItemChange = (id: number, field: keyof BillItem, value: string | number) => {
    setItems(prevItems => {
        const newItems = prevItems.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });

        const lastItem = newItems[newItems.length - 1];
        if (lastItem.id === id && (lastItem.name || lastItem.batch || lastItem.expiry || lastItem.mrp > 0)) {
            return [...newItems, { id: Date.now(), name: '', batch: '', expiry: '', qty: 1, mrp: 0, discount: 0, gst: 0 }];
        }
        
        return newItems;
    });
  };


  const removeItem = (id: number) => {
    if (items.length > 1) {
        setItems(items.filter(item => item.id !== id));
    } else if (items.length === 1 && items[0].id === id) {
        // Clear the only row instead of removing it
        setItems([{ id: Date.now(), name: '', batch: '', expiry: '', qty: 1, mrp: 0, discount: 0, gst: 0 }]);
    }
  }

  
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery) return [];
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
      customer.mobile.includes(customerSearchQuery)
    );
  }, [customerSearchQuery, customers]);

  const handleSelectCustomer = (customer: Customer) => {
      setSelectedCustomer(customer);
      setCustomerSearchQuery('');
      setIsCustomerPopoverOpen(false);
  }

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomer.name && newCustomer.mobile) {
        const newCustomerData = { ...newCustomer, id: customers.length + 1, age: parseInt(newCustomer.age) || null };
        setCustomers([...customers, newCustomerData]);
        setSelectedCustomer(newCustomerData);
        setCustomerSearchQuery('');
        setNewCustomer({name: '', mobile: '', address: '', age: ''});
        setIsAddCustomerDialogOpen(false);
    }
  }

  const filteredMedicines = useMemo(() => {
    if (!searchQuery) return [];
    return availableMedicines.filter(med =>
        med.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);
  
  const getStatusVariant = (status: RecentSale['status']) => {
    switch (status) {
        case 'Completed': return 'default';
        case 'Pending': return 'secondary';
        case 'Draft': return 'outline';
    }
  }

  const filteredRecentSales = useMemo(() => {
    if (!recentSalesSearchQuery) return recentSales;
    return recentSales.filter(sale =>
      sale.invoiceId.toLowerCase().includes(recentSalesSearchQuery.toLowerCase()) ||
      sale.customer.toLowerCase().includes(recentSalesSearchQuery.toLowerCase())
    );
  }, [recentSalesSearchQuery, recentSales]);
  
  const handlePrint = () => {
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(18);
    doc.text(settings.storeName || 'Srimona MedSoft', 14, 22);
    doc.setFontSize(11);
    doc.text(settings.address || '123 Pharmacy Lane, Health City, 500018', 14, 30);
    
    let contactLine = '';
    if(settings.showPhoneOnInvoice && settings.phone) contactLine += `Phone: ${settings.phone}`;
    if(settings.showEmailOnInvoice && settings.email) {
        if(contactLine) contactLine += ' | ';
        contactLine += `Email: ${settings.email}`;
    }
    if(contactLine) doc.text(contactLine, 14, 35);
    
    let gstinLineY = contactLine ? 40 : 35;
    if(settings.showGstinOnInvoice && settings.gstin) doc.text(`GSTIN: ${settings.gstin}`, 14, gstinLineY);

    // Bill details
    let detailsY = gstinLineY + 10;
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoiceNumber}`, 14, detailsY);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, detailsY);

    // Customer details
    let customerY = detailsY + 10;
    doc.text('Bill To:', 14, customerY);
    customerY += 5;
    doc.text(`Name: ${selectedCustomer.name}`, 14, customerY);
    customerY += 5;
    doc.text(`Mobile: ${selectedCustomer.mobile}`, 14, customerY);
    if(selectedCustomer.age) {
        customerY += 5;
        doc.text(`Age: ${selectedCustomer.age}`, 14, customerY);
    }


    // Table
    const tableColumn = ["S.No", "Product", "Batch", "Expiry", "Qty", "MRP", "Disc (%)", "Net Amt"];
    const tableRows: any[] = [];

    items.filter(item => item.name).forEach((item, index) => {
        const itemData = [
            index + 1,
            item.name,
            item.batch,
            item.expiry,
            item.qty,
            item.mrp.toFixed(2),
            item.discount.toFixed(2),
            calculateItemTotal(item).toFixed(2)
        ];
        tableRows.push(itemData);
    });

    (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: customerY + 5,
    });
    
    const finalY = (doc as any).lastAutoTable.finalY;

    // Bill summary
    doc.setFontSize(11);
    doc.text(`Subtotal:`, 150, finalY + 10);
    doc.text(`₹${subtotal.toFixed(2)}`, 180, finalY + 10);
    doc.text(`Discount:`, 150, finalY + 15);
    doc.text(`- ₹${totalDiscount.toFixed(2)}`, 180, finalY + 15);
    doc.text(`GST:`, 150, finalY + 20);
    doc.text(`+ ₹${totalGst.toFixed(2)}`, 180, finalY + 20);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total:`, 150, finalY + 30);
    doc.text(`₹${Math.round(finalTotal).toFixed(2)}`, 180, finalY + 30);
    doc.setFont('helvetica', 'normal');

    // Footer
    doc.setFontSize(9);
    let footerY = finalY + 45;
    if(settings.invoiceFooterNote) {
        doc.text(settings.invoiceFooterNote, 14, footerY);
    }
    doc.text("Pharmacist Signature:", 150, footerY);


    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };


  return (
    <div className="space-y-8">
      <div className="space-y-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Create Bill</CardTitle>
                <CardDescription>
                  Select a customer and add products to the bill.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
               <Dialog open={isAddCustomerDialogOpen} onOpenChange={setIsAddCustomerDialogOpen}>
                <div className="space-y-2">
                  <Label>Customer</Label>
                  <div className="flex gap-2">
                    <Popover open={isCustomerPopoverOpen} onOpenChange={setIsCustomerPopoverOpen}>
                      <PopoverTrigger asChild>
                        <div className="relative w-full">
                          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Search customer by name or mobile..."
                            className="pl-8"
                            value={customerSearchQuery}
                            onChange={(e) => {
                              setCustomerSearchQuery(e.target.value);
                              if (!isCustomerPopoverOpen) setIsCustomerPopoverOpen(true);
                            }}
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                              <div
                                key={customer.id}
                                className="flex items-center justify-between p-2 hover:bg-muted"
                              >
                                <div>
                                  <p>{customer.name}</p>
                                  <p className="text-sm text-muted-foreground">{customer.mobile}</p>
                                </div>
                                <Button size="sm" onClick={() => handleSelectCustomer(customer)}>Select</Button>
                              </div>
                            ))
                          ) : (
                            <div 
                              onClick={() => {
                                setIsCustomerPopoverOpen(false);
                                setIsAddCustomerDialogOpen(true);
                              }}
                              className="p-2 text-center text-sm cursor-pointer hover:bg-muted"
                            >
                                No customer found. <span className="font-semibold text-primary">Click to Add New Customer</span>
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add Customer
                      </Button>
                    </DialogTrigger>
                  </div>
                   {selectedCustomer && (
                    <div className="mt-4 p-3 rounded-md bg-secondary text-sm">
                        <div className="flex flex-col gap-1">
                            <p><span className="font-medium">Name:</span> {selectedCustomer.name}</p>
                            <p><span className="font-medium">Mobile:</span> {selectedCustomer.mobile}</p>
                            {selectedCustomer.age && (
                                <p><span className="font-medium">Age:</span> {selectedCustomer.age}</p>
                            )}
                        </div>
                    </div>
                    )}
                </div>
                <DialogContent>
                  <form onSubmit={handleSaveCustomer}>
                    <DialogHeader>
                      <DialogTitle>Add New Customer</DialogTitle>
                      <DialogDescription>
                        Enter the details of the new customer.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Name</Label>
                        <Input
                          id="name"
                          className="col-span-3"
                          value={newCustomer.name}
                          onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mobile" className="text-right">Mobile</Label>
                        <Input
                          id="mobile"
                          className="col-span-3"
                          value={newCustomer.mobile}
                          onChange={(e) => setNewCustomer({ ...newCustomer, mobile: e.target.value })}
                          required
                        />
                      </div>
                       <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="age" className="text-right">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          className="col-span-3"
                          value={newCustomer.age}
                          onChange={(e) => setNewCustomer({ ...newCustomer, age: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="address" className="text-right">Address</Label>
                        <Input
                          id="address"
                          className="col-span-3"
                          value={newCustomer.address}
                          onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit">Save Customer</Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
              <Separator />
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-8'>S.No</TableHead>
                      <TableHead className="w-[30%]">Product</TableHead>
                      <TableHead>Batch</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead className="w-[120px]">Qty</TableHead>
                      <TableHead>MRP</TableHead>
                      <TableHead>Disc (%)</TableHead>
                      <TableHead>Net Amt</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                        <TableRow key={item.id}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">
                            <Input
                                type="text"
                                placeholder="Medicine Name"
                                className="h-8"
                                value={item.name}
                                onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                                type="text"
                                placeholder="Batch No."
                                className="h-8 w-24"
                                value={item.batch}
                                onChange={(e) => handleItemChange(item.id, 'batch', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                                type="text"
                                placeholder="MM/YY"
                                className="h-8 w-20"
                                value={item.expiry}
                                onChange={(e) => handleItemChange(item.id, 'expiry', e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                                type="number"
                                className="h-8 w-16 text-center"
                                value={item.qty}
                                onChange={(e) => handleItemChange(item.id, 'qty', parseInt(e.target.value) || 1)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                                type="number"
                                placeholder="0.00"
                                className="h-8 w-20"
                                value={item.mrp || ''}
                                onChange={(e) => handleItemChange(item.id, 'mrp', parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                           <TableCell>
                            <Input 
                                type="number" 
                                className="h-8 w-16" 
                                value={item.discount}
                                onChange={(e) => handleItemChange(item.id, 'discount', parseFloat(e.target.value) || 0)}
                            />
                          </TableCell>
                          <TableCell>₹{calculateItemTotal(item).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => removeItem(item.id)}>
                              <Trash2 className="w-4 h-4"/>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    }
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bill Summary</CardTitle>
              <CardDescription>Invoice #{invoiceNumber}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>- ₹{totalDiscount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>GST</span>
                  <span>+ ₹{totalGst.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>₹{finalTotal.toFixed(2)}</span>
                </div>
                 <div className="flex justify-between font-bold text-xl text-primary">
                  <span>To Pay</span>
                  <span>₹{Math.round(finalTotal).toFixed(2)}</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                  <Label>Payment Mode</Label>
                  <Select defaultValue="cash">
                      <SelectTrigger>
                          <SelectValue placeholder="Select payment mode" />
                      </SelectTrigger>
                      <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="upi">UPI</SelectItem>
                          <SelectItem value="wallet">Wallet</SelectItem>
                      </SelectContent>
                  </Select>
              </div>

            </CardContent>
            <CardFooter className="flex-col gap-2">
              <Button className="w-full" onClick={handlePrint}>Save and Print Invoice</Button>
              <Button variant="outline" className="w-full">Save as Draft</Button>
            </CardFooter>
          </Card>
        </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>A list of recently processed transactions.</CardDescription>
            </div>
            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by invoice or customer..."
                    className="w-full rounded-lg bg-secondary pl-8 md:w-[200px] lg:w-[336px]"
                    value={recentSalesSearchQuery}
                    onChange={(e) => setRecentSalesSearchQuery(e.target.value)}
                />
            </div>
        </CardHeader>
        <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Total (₹)</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                   {filteredRecentSales.length > 0 ? (
                    filteredRecentSales.map(sale => (
                     <TableRow key={sale.invoiceId}>
                        <TableCell className="font-medium">{sale.invoiceId}</TableCell>
                        <TableCell>{sale.customer}</TableCell>
                        <TableCell>{sale.date}</TableCell>
                        <TableCell>{sale.total.toFixed(2)}</TableCell>
                        <TableCell>
                            <Badge variant={getStatusVariant(sale.status)}>{sale.status}</Badge>
                        </TableCell>
                     </TableRow>
                   ))
                   ) : (
                    <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center">No recent sales.</TableCell>
                    </TableRow>
                   )}
                </TableBody>
             </Table>
        </CardContent>
      </Card>
    </div>
  );
}
