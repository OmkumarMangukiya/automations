"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "./components/data-table";
import { AnalyticsDashboard } from "./components/analytics-dashboard";
import { WorkflowData } from "@/types/workflow";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Users, BarChart2, PlusCircle } from "lucide-react";
import { ProspectsUploader } from "@/components/prospects-uploader";

export default function WorkflowPage() {
  const params = useParams();
  const workflowId = params.workflowId as string;
  const [data, setData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        "https://chiefbusiness.app.n8n.cloud/webhook/trigger",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ "reason":"data" }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      // Handle potential data key mismatches (Bugdet vs Budget)
      const normalizedData = {
        ...result,
        "Prospects Data": result["Prospects Data"]?.map((prospect: any) => ({
          ...prospect,
          // Handle the typo in the API response (Bugdet -> Budget)
          Budget: prospect.Budget || prospect.Bugdet || 0,
        })) || [],
      };
      
      setData(normalizedData);
    } catch (err) {
      console.error("Error fetching workflow data:", err);
      setError(
        err instanceof Error 
          ? err.message 
          : "Failed to load workflow data. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  }, [workflowId]);

  const handleUploadSuccess = useCallback(() => {
    // Refresh the data when prospects are successfully uploaded
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="text-center space-y-4 py-12">
        <p className="text-muted-foreground">No data available for this workflow.</p>
        <Button onClick={() => window.location.reload()}>Refresh Data</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {data?.["Workflow Name"] || "Workflow Details"}
        </h1>
        <p className="text-muted-foreground">
          View and manage your workflow analytics and data
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart2 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="prospects" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Prospects
          </TabsTrigger>
          <TabsTrigger value="add-prospects" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add Prospects
          </TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-4">
          <AnalyticsDashboard data={data.Analytics} />
        </TabsContent>

        <TabsContent value="prospects" className="space-y-4">
          <div className="rounded-lg border bg-card p-6 shadow-sm">
            <DataTable data={data?.["Prospects Data"] || []} />
          </div>
        </TabsContent>

        <TabsContent value="add-prospects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Prospects</CardTitle>
            </CardHeader>
            <CardContent>
              <ProspectsUploader 
                workflowId={workflowId} 
                onUploadSuccess={handleUploadSuccess} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configure your workflow settings here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
