
'use client';

import { File, PlusCircle, ListFilter, Menu, Search, Package, CheckCircle, TriangleAlert, XCircle, IndianRupee, Clock, Download, SlidersHorizontal, FileText, FilterX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocalStorage } from '@/hooks/use-local-storage';
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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

type Status = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Near Expiry' | 'Expired';

const initialNewMedicineState: Omit<Medicine, 'id'> = {
    brandName: '',
    genericName: '',
    strength: '',
    form: '',
    hsn: '',
    stock: 0,
    mrp: 0,
    expiryDate: '',
    batchNo: '',
    gst: 12,
};

const StatCard = ({ title, value, icon: Icon, color, details, onClick, isActive }: { title: string, value: string | number, icon: React.ElementType, color: string, details?: string, onClick?: () => void, isActive?: boolean }) => (
    <Card 
        className={cn("border-l-4 cursor-pointer hover:bg-muted/50 transition-colors", color, isActive && "bg-muted ring-2 ring-primary")}
        onClick={onClick}
    >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {details && <p className="text-xs text-muted-foreground">{details}</p>}
        </CardContent>
    </Card>
);

function InventoryPage() {
  const [medicines, setMedicines] = useLocalStorage<Medicine[]>('medicines', []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newMedicine, setNewMedicine] = useState(initialNewMedicineState);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<Status | 'all'>('all');
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewMedicine(prev => ({ ...prev, [id]: value }));
  };
  
  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setNewMedicine(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
  }

  const handleSaveMedicine = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (newMedicine.brandName && newMedicine.mrp > 0 && newMedicine.stock >= 0 && newMedicine.expiryDate) {
      const newMedicineData = { ...newMedicine, id: Date.now() };
      setMedicines(prev => [...prev, newMedicineData]);
      setNewMedicine(initialNewMedicineState);
      setIsAddDialogOpen(false);
      toast({
        title: "Medicine Added",
        description: `${newMedicine.brandName} has been added to your inventory.`,
      });
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Data",
            description: "Please fill all required fields correctly.",
        });
    }
  }, [newMedicine, setMedicines, toast]);

  const getStatus = useCallback((med: Medicine): Status => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const expiryDate = new Date(med.expiryDate);
    
    if (expiryDate < today) return 'Expired';
    if (med.stock === 0) return 'Out of Stock';
    
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(today.getDate() + 60);

    if (expiryDate <= sixtyDaysFromNow) return 'Near Expiry';
    if (med.stock < 10) return 'Low Stock';
    return 'In Stock';
  }, []);
  
  const getBadgeVariant = (status: Status) => {
    switch (status) {
      case 'Low Stock': return 'destructive';
      case 'Out of Stock': return 'destructive';
      case 'Expired': return 'destructive';
      case 'Near Expiry': return 'outline';
      default: return 'secondary';
    }
  };

  const getBadgeClass = (status: Status) => {
    switch (status) {
      case 'Near Expiry': return 'text-orange-500 border-orange-500';
      case 'Expired': return 'text-white bg-red-600 border-red-600';
      default: return '';
    }
  }

  const stats = useMemo(() => {
    const totalValue = medicines.reduce((acc, med) => acc + (med.stock * med.mrp), 0);
    const nearExpiryCount = medicines.filter(m => getStatus(m) === 'Near Expiry').length;
    
    return {
        totalMedicines: medicines.length,
        inStock: medicines.filter(m => getStatus(m) === 'In Stock').length,
        lowStock: medicines.filter(m => getStatus(m) === 'Low Stock').length,
        outOfStock: medicines.filter(m => getStatus(m) === 'Out of Stock').length,
        totalValue: `₹${totalValue.toLocaleString('en-IN')}`,
        nearExpiry: nearExpiryCount,
        expired: medicines.filter(m => getStatus(m) === 'Expired').length,
    }
  }, [medicines, getStatus]);

  const filteredMedicines = useMemo(() => {
    let filtered = medicines;

    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(med => 
            med.brandName.toLowerCase().includes(lowercasedQuery) ||
            med.genericName.toLowerCase().includes(lowercasedQuery) ||
            med.hsn.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    if (activeFilter !== 'all') {
        filtered = filtered.filter(med => getStatus(med) === activeFilter);
    }
    
    return filtered;
  }, [searchQuery, medicines, activeFilter, getStatus]);

  const handleFilterClick = (filter: Status | 'all') => {
    setActiveFilter(prev => prev === filter ? 'all' : filter);
  };
  
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
                <p className="text-muted-foreground">
                    Manage your entire medicine stock efficiently.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <StatCard title="Total Medicines" value={stats.totalMedicines} icon={Package} color="border-blue-500" onClick={() => handleFilterClick('all')} isActive={activeFilter === 'all'} />
                <StatCard title="In Stock" value={stats.inStock} icon={CheckCircle} color="border-green-500" onClick={() => handleFilterClick('In Stock')} isActive={activeFilter === 'In Stock'} />
                <StatCard title="Low Stock" value={stats.lowStock} icon={TriangleAlert} color="border-orange-500" onClick={() => handleFilterClick('Low Stock')} isActive={activeFilter === 'Low Stock'} />
                <StatCard title="Out of Stock" value={stats.outOfStock} icon={XCircle} color="border-red-500" onClick={() => handleFilterClick('Out of Stock')} isActive={activeFilter === 'Out of Stock'} />
                <StatCard title="Near Expiry" value={stats.nearExpiry} icon={Clock} color="border-yellow-500" onClick={() => handleFilterClick('Near Expiry')} isActive={activeFilter === 'Near Expiry'} details="Expires in 60 days" />
                <StatCard title="Expired" value={stats.expired} icon={XCircle} color="border-red-700" onClick={() => handleFilterClick('Expired')} isActive={activeFilter === 'Expired'} />
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="relative flex-1 w-full md:grow-0">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search by brand, generic name, HSN..."
                                className="w-full rounded-lg bg-background pl-8"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                             <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="gap-1">
                                        <SlidersHorizontal className="h-4 w-4" />
                                        <span>Filters</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuCheckboxItem checked={activeFilter === 'In Stock'} onCheckedChange={() => handleFilterClick('In Stock')}>In Stock</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={activeFilter === 'Low Stock'} onCheckedChange={() => handleFilterClick('Low Stock')}>Low Stock</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={activeFilter === 'Out of Stock'} onCheckedChange={() => handleFilterClick('Out of Stock')}>Out of Stock</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={activeFilter === 'Near Expiry'} onCheckedChange={() => handleFilterClick('Near Expiry')}>Near Expiry</DropdownMenuCheckboxItem>
                                    <DropdownMenuCheckboxItem checked={activeFilter === 'Expired'} onCheckedChange={() => handleFilterClick('Expired')}>Expired</DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            {activeFilter !== 'all' && (
                                <Button variant="ghost" className="gap-1 text-red-500 hover:text-red-600" onClick={() => setActiveFilter('all')}>
                                    <FilterX className="h-4 w-4" />
                                    <span>Clear Filter</span>
                                </Button>
                            )}
                             <Button variant="outline" className="gap-1">
                                <Download className="h-4 w-4" />
                                <span>Export</span>
                            </Button>
                            <DialogTrigger asChild>
                                <Button className="gap-1">
                                    <PlusCircle className="h-4 w-4" />
                                    <span>Add Medicine</span>
                                </Button>
                            </DialogTrigger>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Brand Name</TableHead>
                        <TableHead>Generic Name</TableHead>
                        <TableHead>Batch No</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>MRP (₹)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredMedicines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    {searchQuery ? "No medicines match your search." : activeFilter !== 'all' ? `No medicines with status "${activeFilter}".` : "No medicines in inventory. Add one to get started."}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredMedicines.map((med) => {
                            const status = getStatus(med);
                            return (
                                <TableRow key={med.id}>
                                    <TableCell className="font-medium">{med.brandName}</TableCell>
                                    <TableCell>{med.genericName}</TableCell>
                                    <TableCell>{med.batchNo}</TableCell>
                                    <TableCell>{new Date(med.expiryDate).toLocaleDateString('en-GB')}</TableCell>
                                    <TableCell>{med.stock}</TableCell>
                                    <TableCell>{med.mrp.toFixed(2)}</TableCell>
                                    <TableCell>
                                    <Badge variant={getBadgeVariant(status)} className={cn('whitespace-nowrap', getBadgeClass(status))}>
                                        {status}
                                    </Badge>
                                    </TableCell>
                                    <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                        <Button aria-haspopup="true" size="icon" variant="ghost">
                                            <Menu className="h-4 w-4" />
                                            <span className="sr-only">Toggle menu</span>
                                        </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit</DropdownMenuItem>
                                        <DropdownMenuItem>View Details</DropdownMenuItem>
                                        <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            )
                            })
                        )}
                    </TableBody>
                    </Table>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">
                    Showing <strong>{filteredMedicines.length}</strong> of <strong>{medicines.length}</strong> products
                    </div>
                </CardFooter>
            </Card>
        </div>
        <DialogContent className="sm:max-w-3xl">
            <form onSubmit={handleSaveMedicine}>
                <DialogHeader>
                    <DialogTitle>Add New Medicine</DialogTitle>
                    <DialogDescription>
                    Enter the details of the new medicine to add it to your inventory.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="brandName">Brand Name *</Label>
                            <Input id="brandName" value={newMedicine.brandName} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="genericName">Generic Name</Label>
                            <Input id="genericName" value={newMedicine.genericName} onChange={handleInputChange} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="batchNo">Batch Number *</Label>
                            <Input id="batchNo" value={newMedicine.batchNo} onChange={handleInputChange} required/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date *</Label>
                            <Input id="expiryDate" type="date" value={newMedicine.expiryDate} onChange={handleInputChange} required/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="stock">Stock (Units) *</Label>
                            <Input id="stock" type="number" value={newMedicine.stock} onChange={handleNumberInputChange} required/>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mrp">MRP (₹) *</Label>
                            <Input id="mrp" type="number" value={newMedicine.mrp} onChange={handleNumberInputChange} required/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="gst">GST Slab (%) *</Label>
                            <Input id="gst" type="number" value={newMedicine.gst} onChange={handleNumberInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="hsn">HSN Code</Label>
                            <Input id="hsn" value={newMedicine.hsn} onChange={handleInputChange} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="strength">Strength</Label>
                            <Input id="strength" value={newMedicine.strength} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="form">Form (e.g., Tablet, Capsule)</Label>
                            <Input id="form" value={newMedicine.form} onChange={handleInputChange} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit">Save Medicine</Button>
                </DialogFooter>
            </form>
        </DialogContent>
    </Dialog>
  );
}

export default React.memo(InventoryPage);
