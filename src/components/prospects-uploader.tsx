"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Prospect {
  Name: string;
  'Phone Number': string;
}

export function ProspectsUploader({
  workflowId,
  onUploadSuccess,
}: {
  workflowId: string;
  onUploadSuccess: () => void;
}) {
  const [prospects, setProspects] = useState<Prospect[]>([{ Name: "", 'Phone Number': "" }]);
  
  // Ensure all prospects have the required fields
  const safeProspects = prospects.map(prospect => ({
    Name: prospect?.Name || "",
    'Phone Number': prospect?.['Phone Number'] || ""
  }));
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddRow = () => {
    setProspects([...safeProspects, { Name: "", 'Phone Number': "" }]);
  };

  const handleRemoveRow = (index: number) => {
    const newProspects = [...safeProspects];
    newProspects.splice(index, 1);
    setProspects(newProspects.length ? newProspects : [{ Name: "", 'Phone Number': "" }]);
  };

  const handleInputChange = (index: number, field: 'Name' | 'Phone Number', value: string) => {
    const newProspects = [...safeProspects];
    newProspects[index] = { ...newProspects[index], [field]: value };
    setProspects(newProspects);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csvData = event.target?.result as string;
        const lines = csvData.split("\n").filter(line => line.trim() !== '');
        
        // Skip header row if it exists
        const startIndex = lines[0].toLowerCase().includes('name') && lines[0].toLowerCase().includes('phone') ? 1 : 0;
        
        const parsedProspects = lines.slice(startIndex).map(line => {
          const [name, phone] = line.split(',').map(item => item.trim().replace(/^"/g, '').replace(/"$/g, ''));
          return { Name: name || '', 'Phone Number': phone || '' };
        });
        
        setProspects(parsedProspects.length ? parsedProspects : [{ Name: "", 'Phone Number': "" }]);
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    try {
      setIsUploading(true);
      
      // Filter out empty rows
      const validProspects = safeProspects.filter(p => p.Name.trim() && p['Phone Number'].trim());
      
      if (validProspects.length === 0) {
        toast.error('Please add at least one valid prospect');
        return;
      }

      const response = await fetch(
        "https://chiefbusiness.app.n8n.cloud/webhook/trigger",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: "addProspects",
            prospects: validProspects,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.uploaded === "true") {
        toast.success('Prospects uploaded successfully!');
        setProspects([{ Name: "", 'Phone Number': "" }]);
        onUploadSuccess();
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading prospects:', error);
      toast.error('Failed to upload prospects. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Add Prospects</h3>
          <div className="flex space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Import CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddRow}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Row
            </Button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv"
            className="hidden"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Add prospects manually or upload a CSV file with Name and Phone Number columns
        </p>
      </div>

      <div className="space-y-4">
        {safeProspects.map((prospect, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-5">
              <Label htmlFor={`Name-${index}`} className="sr-only">
                Name
              </Label>
              <Input
                id={`Name-${index}`}
                placeholder="Name"
                value={prospect.Name}
                onChange={(e) =>
                  handleInputChange(index, "Name", e.target.value)
                }
              />
            </div>
            <div className="col-span-5">
              <Label htmlFor={`Phone-Number-${index}`} className="sr-only">
                Phone Number
              </Label>
              <Input
                id={`Phone-Number-${index}`}
                placeholder="Phone Number"
                value={prospect['Phone Number']}
                onChange={(e) =>
                  handleInputChange(index, "Phone Number", e.target.value)
                }
              />
            </div>
            <div className="col-span-2 flex justify-end">
              {prospects.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveRow(index)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove</span>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Prospects'}
        </Button>
      </div>
    </div>
  );
}
