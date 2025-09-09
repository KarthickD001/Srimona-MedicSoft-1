
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '@/components/ui/select';
import { Badge } from "@/components/ui/badge"
import React, { useContext, useState, useEffect, useRef } from "react"
import { SettingsContext } from "@/context/settings-context"
import { useToast } from "@/hooks/use-toast"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import Link from "next/link"
import { ArrowRight, Upload, X, Crop } from "lucide-react"
import Image from "next/image"

const users: any[] = []

export default function SettingsPage() {
    const { settings, setSettings } = useContext(SettingsContext);
    const { toast } = useToast();
    const [isClient, setIsClient] = useState(false);
    const logoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setSettings(prev => ({ ...prev, [id]: value }));
    }
    
    const handleSwitchChange = (id: keyof typeof settings, checked: boolean) => {
        setSettings(prev => ({ ...prev, [id]: checked as any }));
    }

    const handleSelectChange = (id: keyof typeof settings, value: string) => {
        setSettings(prev => ({...prev, [id]: value}));
    }

    const handleSaveChanges = () => {
        toast({
            title: "Settings Saved",
            description: "Your store information has been updated.",
        });
    }

    const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings(prev => ({...prev, logo: reader.result as string}));
                toast({
                    title: "Logo Updated",
                    description: "Your new logo has been uploaded.",
                })
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleRemoveLogo = () => {
        setSettings(prev => ({...prev, logo: ''}));
        toast({
            title: "Logo Removed",
            description: "Your logo has been removed.",
        })
    }

    if (!isClient) {
        return null; // Or a loading skeleton
    }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Settings</h3>
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
                    <div className="space-y-2">
                        <Label htmlFor="logo">Company Logo</Label>
                        <div className="flex items-center gap-4">
                            {settings.logo ? (
                                <div className="relative h-20 w-20 border rounded-md p-1">
                                    <Image src={settings.logo} alt="Company Logo" fill style={{ objectFit: 'contain' }} />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                        onClick={handleRemoveLogo}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="h-20 w-20 border rounded-md flex items-center justify-center bg-muted">
                                    <span className="text-xs text-muted-foreground">No Logo</span>
                                </div>
                            )}
                            <div className="flex flex-col gap-2">
                                <Button variant="outline" onClick={() => logoInputRef.current?.click()}>
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Logo
                                </Button>
                                <Button variant="outline" disabled={!settings.logo}>
                                    <Crop className="mr-2 h-4 w-4" />
                                    Fix Ratio
                                </Button>
                            </div>
                            <input
                                type="file"
                                ref={logoInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg"
                                onChange={handleLogoUpload}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">Upload a PNG or JPG file. Recommended size: 200x100 pixels.</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                        <Label htmlFor="invoiceTemplate">Invoice Design</Label>
                         <Select value={settings.invoiceTemplate} onValueChange={(value) => handleSelectChange('invoiceTemplate', value)}>
                            <SelectTrigger id="invoiceTemplate">
                                <SelectValue placeholder="Select a template" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="modern">Modern</SelectItem>
                                <SelectItem value="classic">Classic</SelectItem>
                                <SelectItem value="simple">Simple</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            Choose the design template for your printed invoices.
                        </p>
                    </div>
                     <Separator />
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
                     <div className="flex items-center justify-between rounded-lg border p-4">
                        <div>
                            <Label>Import/Export Utility</Label>
                            <p className="text-sm text-muted-foreground">
                                Use the dedicated utility to export backups or import data.
                            </p>
                        </div>
                        <Button asChild>
                            <Link href="/import-export">
                                Go to Import/Export <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
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
