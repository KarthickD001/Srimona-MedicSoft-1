
'use client';

import { File, PlusCircle, ListFilter, Menu } from 'lucide-react';
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
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface Medicine {
    brandName: string;
    genericName: string;
    strength: string;
    form: string;
    hsn: string;
    stock: number;
    mrp: number;
    status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Near Expiry' | 'Expired';
}

export default function InventoryPage() {
  const [medicines, setMedicines] = useLocalStorage<Medicine[]>('medicines', []);
  
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Low Stock':
        return 'destructive';
      case 'Out of Stock':
        return 'destructive';
      case 'Near Expiry':
        return 'outline';
      case 'Expired':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getBadgeClass = (status: string) => {
    switch (status) {
      case 'Near Expiry':
        return 'text-orange-500 border-orange-500';
      case 'Expired':
        return 'text-red-600 border-red-600'
      default:
        return '';
    }
  }

  return (
    <Tabs defaultValue="all">
      <div className="flex items-center">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="low">Low Stock</TabsTrigger>
          <TabsTrigger value="near_expiry">Near Expiry</TabsTrigger>
          <TabsTrigger value="expired" className="text-destructive">Expired</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="all">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Inventory</CardTitle>
                <CardDescription>
                  Manage your medicines and view their stock status.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="h-8 gap-1">
                      <ListFilter className="h-3.5 w-3.5" />
                      <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        Filter
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem checked>
                      In Stock
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>Expired</DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem>
                      Out of Stock
                    </DropdownMenuCheckboxItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <File className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sronly sm:whitespace-nowrap">
                    Export
                  </span>
                </Button>
                <Button size="sm" className="h-8 gap-1">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                    Add Medicine
                  </span>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Generic Name</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead className="hidden md:table-cell">Form</TableHead>
                  <TableHead className="hidden md:table-cell">HSN</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>MRP (₹)</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicines.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={9} className="h-24 text-center">No medicines in inventory.</TableCell>
                    </TableRow>
                ) : (
                    medicines.map((med) => (
                    <TableRow key={med.brandName}>
                        <TableCell className="font-medium">{med.brandName}</TableCell>
                        <TableCell>{med.genericName}</TableCell>
                        <TableCell>{med.strength}</TableCell>
                        <TableCell className="hidden md:table-cell">{med.form}</TableCell>
                        <TableCell className="hidden md:table-cell">{med.hsn}</TableCell>
                        <TableCell>{med.stock}</TableCell>
                        <TableCell>{med.mrp.toFixed(2)}</TableCell>
                        <TableCell>
                        <Badge variant={getBadgeVariant(med.status)} className={getBadgeClass(med.status)}>
                            {med.status}
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
                            <DropdownMenuItem>View Batches</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        </TableCell>
                    </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter>
            <div className="text-xs text-muted-foreground">
              Showing <strong>{medicines.length}</strong> of <strong>{medicines.length}</strong> products
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
