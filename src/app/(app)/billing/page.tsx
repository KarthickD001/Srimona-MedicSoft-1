
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
import React, { useState, useMemo, useEffect, useContext, memo, useCallback, useRef } from 'react';
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
import Image from 'next/image';

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
  items: BillItem[];
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
    expiryDate: string;
    batchNo: string;
    gst: number;
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

const initialItems: BillItem[] = [{ id: Date.now(), name: '', batch: '', expiry: '', qty: 1, mrp: 0, discount: 0, gst: 0 }];

const calculateItemTotal = (item: BillItem) => {
    const discountedPrice = item.mrp * (1 - item.discount / 100);
    const gstAmount = discountedPrice * (item.gst / 100);
    const total = discountedPrice + gstAmount;
    return total * item.qty;
};

const BillTableRow = memo(function BillTableRow({ item: initialItem, index, onUpdate, onRemove, onMaybeAddNewRow, isLastRow, availableMedicines }: { item: BillItem, index: number, onUpdate: (id: number, updatedItem: BillItem) => void, onRemove: (id: number) => void, onMaybeAddNewRow: () => void, isLastRow: boolean, availableMedicines: Medicine[] }) {
    const [item, setItem] = useState(initialItem);
    const [medicineSearch, setMedicineSearch] = useState('');
    const [isMedicinePopoverOpen, setIsMedicinePopoverOpen] = useState(false);
    
    const nameInputRef = useRef<HTMLInputElement>(null);
    const batchInputRef = useRef<HTMLInputElement>(null);
    const expiryInputRef = useRef<HTMLInputElement>(null);
    const qtyInputRef = useRef<HTMLInputElement>(null);
    const mrpInputRef = useRef<HTMLInputElement>(null);
    const discountInputRef = useRef<HTMLInputElement>(null);

    const inputRefs = [nameInputRef, batchInputRef, expiryInputRef, qtyInputRef, mrpInputRef, discountInputRef];

    useEffect(() => {
        setItem(initialItem);
        setMedicineSearch(initialItem.name);
    }, [initialItem]);
    
    const handleSelectMedicine = (medicine: Medicine) => {
        const updatedItem: BillItem = {
            ...item,
            name: medicine.brandName,
            batch: medicine.batchNo,
            expiry: new Date(medicine.expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: '2-digit' }).replace('/', '/'),
            mrp: medicine.mrp,
            gst: medicine.gst,
        };
        setItem(updatedItem);
        onUpdate(item.id, updatedItem);
        setMedicineSearch(medicine.brandName);
        setIsMedicinePopoverOpen(false);
        batchInputRef.current?.focus();
    };

    const handleLocalChange = (field: keyof BillItem, value: any) => {
        const updatedItem = { ...item, [field]: value };
        setItem(updatedItem);
        if (field === 'name') {
            setMedicineSearch(value);
        }
        if (isLastRow) {
            onMaybeAddNewRow();
        }
    };
    
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleLocalChange('name', e.target.value)
        if(!isMedicinePopoverOpen) setIsMedicinePopoverOpen(true);
    }

    const handleBlur = () => {
        onUpdate(item.id, item);
    }
    
    const filteredMedicines = useMemo(() => {
        if (!medicineSearch) return [];
        return availableMedicines.filter(med =>
            med.brandName.toLowerCase().includes(medicineSearch.toLowerCase()) ||
            med.genericName.toLowerCase().includes(medicineSearch.toLowerCase())
        );
      }, [medicineSearch, availableMedicines]);
      
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentRefIndex: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const nextRef = inputRefs[currentRefIndex + 1];
            if (nextRef && nextRef.current) {
                nextRef.current.focus();
            } else {
                 if (isLastRow) {
                    onMaybeAddNewRow();
                }
            }
        }
    }

    return (
        <TableRow>
            <TableCell>{index + 1}</TableCell>
            <TableCell className="font-medium">
                <Popover open={isMedicinePopoverOpen} onOpenChange={setIsMedicinePopoverOpen}>
                  <PopoverTrigger asChild>
                     <Input
                        ref={nameInputRef}
                        type="text"
                        placeholder="Medicine Name"
                        className="h-8"
                        value={medicineSearch}
                        onChange={handleNameChange}
                        onBlur={handleBlur}
                        onKeyDown={(e) => handleKeyDown(e, 0)}
                    />
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                      <div className="max-h-60 overflow-y-auto">
                        {filteredMedicines.length > 0 ? (
                           filteredMedicines.map((med) => (
                             <div key={med.id} className="p-2 hover:bg-muted cursor-pointer" onClick={() => handleSelectMedicine(med)}>
                               <p>{med.brandName}</p>
                               <p className="text-xs text-muted-foreground">{med.genericName} | Stock: {med.stock}</p>
                             </div>
                           ))
                        ) : (
                           <p className="p-2 text-center text-sm">No medicine found.</p>
                        )}
                      </div>
                  </PopoverContent>
                </Popover>
            </TableCell>
            <TableCell>
                <Input
                    ref={batchInputRef}
                    type="text"
                    placeholder="Batch No."
                    className="h-8 w-24"
                    value={item.batch}
                    onChange={(e) => handleLocalChange('batch', e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleKeyDown(e, 1)}
                />
            </TableCell>
            <TableCell>
                <Input
                    ref={expiryInputRef}
                    type="text"
                    placeholder="MM/YY"
                    className="h-8 w-20"
                    value={item.expiry}
                    onChange={(e) => handleLocalChange('expiry', e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleKeyDown(e, 2)}
                />
            </TableCell>
            <TableCell>
                <Input
                    ref={qtyInputRef}
                    type="number"
                    className="h-8 w-16 text-center"
                    value={item.qty}
                    onChange={(e) => handleLocalChange('qty', parseInt(e.target.value) || 1)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleKeyDown(e, 3)}
                />
            </TableCell>
            <TableCell>
                <Input
                    ref={mrpInputRef}
                    type="number"
                    placeholder="0.00"
                    className="h-8 w-20"
                    value={item.mrp || ''}
                    onChange={(e) => handleLocalChange('mrp', parseFloat(e.target.value) || 0)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleKeyDown(e, 4)}
                />
            </TableCell>
            <TableCell>
                <Input
                    ref={discountInputRef}
                    type="number"
                    className="h-8 w-16"
                    value={item.discount}
                    onChange={(e) => handleLocalChange('discount', parseFloat(e.target.value) || 0)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => handleKeyDown(e, 5)}
                />
            </TableCell>
            <TableCell>₹{calculateItemTotal(item).toFixed(2)}</TableCell>
            <TableCell>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => onRemove(item.id)}>
                    <Trash2 className="w-4 h-4" />
                </Button>
            </TableCell>
        </TableRow>
    );
});


function BillingPage() {
  const [items, setItems] = useState<BillItem[]>(initialItems);
  const [medicines, setMedicines] = useLocalStorage<Medicine[]>('medicines', []);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', [{id: 1, name: 'Walk-in Customer', mobile: '9999999999', address: '', age: null, gender: null, prescriptions: 0}]);
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
    // Generate a unique invoice number
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

  
  const subtotal = useMemo(() => items.reduce((acc, item) => acc + (item.mrp * item.qty), 0), [items]);
  const totalDiscount = useMemo(() => items.reduce((acc, item) => acc + (item.mrp * item.qty * (item.discount / 100)), 0), [items]);
  const totalGst = useMemo(() => items.reduce((acc, item) => {
      const discountedPrice = item.mrp * (1 - item.discount / 100);
      return acc + (discountedPrice * (item.gst / 100) * item.qty);
  }, 0), [items]);

  const finalTotal = subtotal - totalDiscount + totalGst;


  const handleItemUpdate = useCallback((id: number, updatedItem: BillItem) => {
    setItems(prevItems => {
        const newItems = [...prevItems];
        const index = newItems.findIndex(item => item.id === id);
        if (index !== -1) {
            newItems[index] = updatedItem;
        }
        return newItems;
    });
  }, []);

  const addNewItem = useCallback(() => {
    setItems(prev => [...prev, { id: Date.now(), name: '', batch: '', expiry: '', qty: 1, mrp: 0, discount: 0, gst: 0 }]);
  }, []);

  const maybeAddNewItem = useCallback(() => {
    setItems(prev => {
        const lastItem = prev[prev.length - 1];
        if (prev.length > 0 && lastItem && (lastItem.name || lastItem.mrp > 0)) {
            const lastInput = document.activeElement as HTMLInputElement;
            const isLastRowBeingEdited = lastInput && lastInput.closest('tr') === lastInput.closest('tbody')?.lastChild;

            if (isLastRowBeingEdited) {
                const newRow = { id: Date.now(), name: '', batch: '', expiry: '', qty: 1, mrp: 0, discount: 0, gst: 0 };
                return [...prev, newRow];
            }
        }
        return prev;
    });
  }, []);


  const removeItem = useCallback((id: number) => {
    setItems(prev => {
        if (prev.length > 1) {
            return prev.filter(item => item.id !== id);
        }
        return [{ id: Date.now(), name: '', batch: '', expiry: '', qty: 1, mrp: 0, discount: 0, gst: 0 }];
    });
  }, []);

  
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery || customerSearchQuery.length < 2) return [];
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

  const handleOpenAddCustomerDialog = () => {
    const isMobile = /^\d{10,12}$/.test(customerSearchQuery);
    const isName = /^[a-zA-Z\s]+$/.test(customerSearchQuery);
    
    setNewCustomer({
        name: isName ? customerSearchQuery : '',
        mobile: isMobile ? customerSearchQuery : '',
        address: '',
        age: ''
    });
    setIsCustomerPopoverOpen(false);
    setIsAddCustomerDialogOpen(true);
    setCustomerSearchQuery('');
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCustomer.name && newCustomer.mobile) {
        const newCustomerData = { ...newCustomer, id: customers.length + 1, age: parseInt(newCustomer.age) || null, gender: null, prescriptions: 0 };
        setCustomers([...customers, newCustomerData]);
        setSelectedCustomer(newCustomerData);
        setCustomerSearchQuery('');
        setNewCustomer({name: '', mobile: '', address: '', age: ''});
        setIsAddCustomerDialogOpen(false);
    }
  }
  
  const getStatusVariant = (status: RecentSale['status']) => {
    switch (status) {
        case 'Completed': return 'default';
        case 'Pending': return 'secondary';
        case 'Draft': return 'outline';
    }
  }

  const filteredRecentSales = useMemo(() => {
    if (!recentSalesSearchQuery) return recentSales.slice().reverse();
    return recentSales.filter(sale =>
      sale.invoiceId.toLowerCase().includes(recentSalesSearchQuery.toLowerCase()) ||
      sale.customer.toLowerCase().includes(recentSalesSearchQuery.toLowerCase())
    ).slice().reverse();
  }, [recentSalesSearchQuery, recentSales]);
  
  const handlePrint = () => {
    const doc = new jsPDF();
    
    // Add logo if available
    if (settings.logo) {
        doc.addImage(settings.logo, 'PNG', 14, 15, 40, 20); // Adjust position and size as needed
    }

    doc.setFontSize(18);
    doc.text(settings.storeName || 'Srimona MedSoft', settings.logo ? 60 : 14, 22);
    doc.setFontSize(11);
    doc.text(settings.address || '123 Pharmacy Lane, Health City, 500018', settings.logo ? 60 : 14, 30);
    
    let contactLineY = settings.logo ? 35 : 35;
    let contactLine = '';
    if(settings.showPhoneOnInvoice && settings.phone) contactLine += `Phone: ${settings.phone}`;
    if(settings.showEmailOnInvoice && settings.email) {
        if(contactLine) contactLine += ' | ';
        contactLine += `Email: ${settings.email}`;
    }
    if(contactLine) doc.text(contactLine, 14, contactLineY);
    
    let gstinLineY = contactLine ? contactLineY + 5 : contactLineY;
    if(settings.showGstinOnInvoice && settings.gstin) doc.text(`GSTIN: ${settings.gstin}`, 14, gstinLineY);

    let detailsY = gstinLineY + 10;
    doc.setFontSize(12);
    doc.text(`Invoice #: ${invoiceNumber}`, 14, detailsY);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 150, detailsY);

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

    doc.setFontSize(9);
    let footerY = finalY + 45;
    if(settings.invoiceFooterNote) {
        doc.text(settings.invoiceFooterNote, 14, footerY);
    }
    doc.text("Pharmacist Signature:", 150, footerY);

    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  };

  const handleSaveAndPrint = () => {
    // 1. Filter out empty items before saving
    const validItems = items.filter(item => item.name && item.mrp > 0 && item.qty > 0);

    if (validItems.length === 0) {
        // You might want to show a toast message here
        return;
    }
    
    // 2. Save the sale
    const newSale: RecentSale = {
      invoiceId: invoiceNumber,
      customer: selectedCustomer.name,
      date: new Date().toLocaleDateString('en-GB'), // DD/MM/YYYY
      total: Math.round(finalTotal),
      status: 'Completed',
      items: validItems,
    };
    const updatedSales = [...recentSales, newSale];
    setRecentSales(updatedSales);
    
    // 3. Update medicine stock
    const updatedMedicines = [...medicines];
    validItems.forEach(item => {
        const medIndex = updatedMedicines.findIndex(med => med.brandName === item.name && med.batchNo === item.batch);
        if (medIndex !== -1) {
            updatedMedicines[medIndex].stock -= item.qty;
        }
    });
    setMedicines(updatedMedicines);

    // 4. Print the invoice
    handlePrint();

    // 5. Reset the form
    setItems(initialItems);
    setSelectedCustomer(customers.find(c => c.name === 'Walk-in Customer') || customers[0]);
    setInvoiceNumber(`JA-2425-${String(updatedSales.length + 1).padStart(4, '0')}`);
  };


  return (
    <div className="flex flex-col gap-8">
      <div>
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
                                if(e.target.value.length >= 2) setIsCustomerPopoverOpen(true);
                                else setIsCustomerPopoverOpen(false);
                            }}
                            onFocus={() => { if(customerSearchQuery) setIsCustomerPopoverOpen(true)}}
                          />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredCustomers.length > 0 ? (
                            filteredCustomers.map((customer) => (
                              <div
                                key={customer.id}
                                className="flex items-center justify-between p-2 hover:bg-muted cursor-pointer"
                                onClick={() => handleSelectCustomer(customer)}
                              >
                                <div>
                                  <p>{customer.name}</p>
                                  <p className="text-sm text-muted-foreground">{customer.mobile}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            customerSearchQuery.length > 1 && (
                                <div 
                                onClick={handleOpenAddCustomerDialog}
                                className="p-2 text-center text-sm cursor-pointer hover:bg-muted"
                                >
                                    No customer found. <span className="font-semibold text-primary">Click to Add New Customer</span>
                                </div>
                            )
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <DialogTrigger asChild>
                      <Button variant="outline" onClick={() => setNewCustomer({name: '', mobile: '', address: '', age: ''})}>
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
                        <BillTableRow 
                            key={item.id}
                            item={item}
                            index={index}
                            onUpdate={handleItemUpdate}
                            onRemove={removeItem}
                            onMaybeAddNewRow={maybeAddNewItem}
                            isLastRow={index === items.length - 1}
                            availableMedicines={medicines}
                        />
                      ))
                    }
                  </TableBody>
                </Table>
              </div>
               <Button onClick={addNewItem} variant="outline" size="sm" className="mt-2">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Row
              </Button>
            </CardContent>
          </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              <Button className="w-full" onClick={handleSaveAndPrint}>Save and Print Invoice</Button>
              <Button variant="outline" className="w-full">Save as Draft</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Sales</CardTitle>
                    <CardDescription>Recently processed transactions.</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative mb-4">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by invoice or customer..."
                        className="w-full rounded-lg bg-secondary pl-8"
                        value={recentSalesSearchQuery}
                        onChange={(e) => setRecentSalesSearchQuery(e.target.value)}
                    />
                </div>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                       {filteredRecentSales.length > 0 ? (
                        filteredRecentSales.map(sale => (
                         <TableRow key={sale.invoiceId}>
                            <TableCell className="font-medium">{sale.invoiceId}</TableCell>
                            <TableCell>{sale.customer}</TableCell>
                            <TableCell>₹{sale.total.toFixed(2)}</TableCell>
                         </TableRow>
                       ))
                       ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">No recent sales.</TableCell>
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

export default BillingPage;
