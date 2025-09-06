
'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table';
import { Badge } from "@/components/ui/badge"
import React, { useContext, useRef } from "react"
import { SettingsContext } from "@/context/settings-context"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const users: any[] = []

export default function SettingsPage() {
    const { settings, setSettings } = useContext(SettingsContext);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    }
    
    const handleSwitchChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked }));
    }

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your store information has been updated.",
        });
    }

    const handleExportData = () => {
        try {
            const customersData = localStorage.getItem('customers');
            
            if (!customersData) {
                toast({
                    variant: 'destructive',
                    title: "Export Failed",
                    description: "No customer data found to export."
                });
                return;
            }

            const data = {
                customers: JSON.parse(customersData)
            };

            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `srimona-medsoft-customers-backup-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);

            toast({
                title: "Export Successful",
                description: "Your customer data has been exported."
            });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: "Export Failed",
                description: "Could not export your customer data. Please try again."
            });
            console.error("Export failed:", error);
        }
    };

    const handleImportData = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("File could not be read.");
                }
                const data = JSON.parse(text);

                if (window.confirm("Are you sure you want to import this data? This will overwrite all current data.")) {
                    localStorage.clear();
                    
                    Object.keys(data).forEach(key => {
                        const value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
                        localStorage.setItem(key, value);
                    });

                    toast({
                        title: "Import Successful",
                        description: "Your data has been imported. The application will now reload.",
                    });
                    
                    // Reload to apply changes
                    setTimeout(() => window.location.reload(), 2000);
                }
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: "Import Failed",
                    description: "The selected file is not valid. Please choose a valid backup file.",
                });
                console.error("Import failed:", error);
            }
        };
        reader.readAsText(file);
    };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-medium">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your pharmacy's settings and preferences.
        </p>
      </div>
      <Separator />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Store Information</CardTitle>
                    <CardDescription>Update your pharmacy's details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="storeName">Store Name</Label>
                        <Input id="storeName" placeholder="e.g. Srimona Pharmacy" value={settings.storeName} onChange={handleInputChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" placeholder="e.g. 123 Pharmacy Lane, Health City, 500018" value={settings.address} onChange={handleInputChange}/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" placeholder="e.g. +91 12345 67890" value={settings.phone} onChange={handleInputChange}/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" placeholder="e.g. contact@srimonapharmacy.com" value={settings.email} onChange={handleInputChange}/>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>GST Settings</CardTitle>
                    <CardDescription>Configure tax information for your store.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="gstin">GSTIN</Label>
                        <Input id="gstin" placeholder="e.g. 29ABCDE1234F1Z5" value={settings.gstin} onChange={handleInputChange}/>
                    </div>
                </CardContent>
            </Card>
             <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Invoice &amp; Print Settings</CardTitle>
                    <CardDescription>Customize the look and feel of your printed invoices.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>Show Phone Number</Label>
                            <p className="text-xs text-muted-foreground">Display your phone number in the invoice header.</p>
                        </div>
                        <Switch id="showPhoneOnInvoice" checked={settings.showPhoneOnInvoice} onCheckedChange={(checked) => handleSwitchChange('showPhoneOnInvoice', checked)} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>Show Email</Label>
                            <p className="text-xs text-muted-foreground">Display your email address in the invoice header.</p>
                        </div>
                        <Switch id="showEmailOnInvoice" checked={settings.showEmailOnInvoice} onCheckedChange={(checked) => handleSwitchChange('showEmailOnInvoice', checked)} />
                    </div>
                    <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                            <Label>Show GSTIN</Label>
                            <p className="text-xs text-muted-foreground">Display your GST Identification Number on the invoice.</p>
                        </div>
                        <Switch id="showGstinOnInvoice" checked={settings.showGstinOnInvoice} onCheckedChange={(checked) => handleSwitchChange('showGstinOnInvoice', checked)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="invoiceFooterNote">Invoice Footer Note</Label>
                        <Textarea id="invoiceFooterNote" placeholder="e.g. Thank you for your business!" value={settings.invoiceFooterNote} onChange={handleInputChange} />
                    </div>
                </CardContent>
            </Card>
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Data Management</CardTitle>
                    <CardDescription>Backup, restore, or manage your application data.</CardDescription>
                </CardHeader>
                <CardContent>
                   <div className="space-y-4">
                     <div>
                        <Label>Local Data Backup</Label>
                        <p className="text-sm text-muted-foreground">
                            Export all your application data into a single file for backup or to transfer to another computer.
                        </p>
                     </div>
                     <div className="flex gap-2">
                        <Button onClick={handleExportData}>Export Customer Data</Button>
                        <Button variant="outline" onClick={handleImportData}>Import Data</Button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept=".json"
                            onChange={handleFileChange}
                        />
                     </div>
                   </div>
                </CardContent>
            </Card>
        </div>
        <div className="md:col-span-1">
            <Card>
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>Manage staff accounts and roles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.length > 0 ? (
                                users.map(user => (
                                    <TableRow key={user.email}>
                                        <TableCell>
                                            <div className="font-medium">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'Administrator' ? 'default' : 'secondary'}>{user.role}</Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2} className="h-24 text-center">No users found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                    <Button className="w-full mt-4">Add User</Button>
                </CardContent>
            </Card>
        </div>
      </div>
      <div className="flex justify-end">
          <Button onClick={handleSaveChanges}>Save Changes</Button>
      </div>
    </div>
  )
}
