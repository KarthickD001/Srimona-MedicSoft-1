
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Upload, FileJson, FileText, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useRef } from 'react';

type DataType = 'medicines' | 'customers' | 'recentSales';

export default function ImportExportPage() {
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const getData = (type: DataType) => {
        if (typeof window === 'undefined') return [];
        const data = localStorage.getItem(type);
        return data ? JSON.parse(data) : [];
    }

    const downloadFile = (filename: string, content: string, contentType: string) => {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    const handleExport = (type: DataType, format: 'json' | 'csv' | 'pdf') => {
        const data = getData(type);
        if (data.length === 0) {
            toast({
                variant: 'destructive',
                title: "Export Failed",
                description: `No data found for ${type} to export.`
            });
            return;
        }

        const date = new Date().toISOString().split('T')[0];
        
        if(format === 'json') {
            const jsonString = JSON.stringify(data, null, 2);
            downloadFile(`${type}-${date}.json`, jsonString, 'application/json');
        }

        if(format === 'csv') {
            const headers = Object.keys(data[0]);
            let csvContent = headers.join(',') + '\n';
            data.forEach((row: any) => {
                const values = headers.map(header => {
                    let value = row[header];
                    if (typeof value === 'string' && value.includes(',')) {
                        return `"${value}"`;
                    }
                    if(typeof value === 'object' && value !== null) {
                        return `"${JSON.stringify(value)}"`;
                    }
                    return value;
                });
                csvContent += values.join(',') + '\n';
            });
            downloadFile(`${type}-${date}.csv`, csvContent, 'text/csv');
        }

        if(format === 'pdf') {
            toast({
                title: "Coming Soon!",
                description: "PDF export functionality will be available in a future update."
            })
            return;
        }

        toast({
            title: "Export Successful",
            description: `Your ${type} data has been exported as a ${format.toUpperCase()} file.`
        });
    }

    const handleImportClick = () => {
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

                if (window.confirm("Are you sure you want to import this data? This will overwrite all current application data.")) {
                    // We don't clear settings, only transactional data
                    // localStorage.clear();
                    
                    Object.keys(data).forEach(key => {
                        const value = typeof data[key] === 'string' ? data[key] : JSON.stringify(data[key]);
                        localStorage.setItem(key, value);
                    });

                    toast({
                        title: "Import Successful",
                        description: "Your data has been imported. The application will now reload.",
                    });
                    
                    // Reload to apply changes across the app
                    setTimeout(() => window.location.reload(), 2000);
                }
            } catch (error) {
                 toast({
                    variant: 'destructive',
                    title: "Import Failed",
                    description: "The selected file is not valid. Please choose a valid backup file.",
                });
                console.error("Import failed:", error);
            } finally {
                // Reset file input
                if(fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        };
        reader.readAsText(file);
    };

    const exportOptions: {type: DataType, name: string}[] = [
        { type: 'medicines', name: 'Medicines Inventory' },
        { type: 'customers', name: 'Customer List' },
        { type: 'recentSales', name: 'Sales Records' }
    ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Import & Export Data</h1>
        <p className="text-muted-foreground">
          Manage your application data by exporting backups or importing data.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>
            Download your application data in various formats.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {exportOptions.map(option => (
                <div key={option.type} className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4">
                    <div className="mb-2 sm:mb-0">
                        <h3 className="font-semibold">{option.name}</h3>
                        <p className="text-sm text-muted-foreground">Export all {option.name.toLowerCase()} to a file.</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleExport(option.type, 'json')}>
                            <FileJson className="mr-2 h-4 w-4" /> JSON
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport(option.type, 'csv')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> CSV
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleExport(option.type, 'pdf')}>
                            <FileText className="mr-2 h-4 w-4" /> PDF
                        </Button>
                    </div>
                </div>
            ))}
        </CardContent>
      </Card>
       <Card>
        <CardHeader>
          <CardTitle>Import Data</CardTitle>
          <CardDescription>
            Import data from a JSON backup file. This will overwrite existing data.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between rounded-lg border p-4">
                <div className="mb-2 sm:mb-0">
                    <h3 className="font-semibold">Import from JSON</h3>
                    <p className="text-sm text-muted-foreground">
                        Restore all application data (medicines, customers, sales) from a single JSON file.
                    </p>
                </div>
                <Button onClick={handleImportClick}>
                    <Upload className="mr-2 h-4 w-4" /> Import Data
                </Button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept=".json"
                    onChange={handleFileChange}
                />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
