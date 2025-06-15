import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import Link from "next/link";

type Workflow = {
  id: string;
  name: string;
  description: string;
  active: boolean;
};

const workflows: Workflow[] = [
  {
    id: "whatsapp-lead-nurturing",
    name: "WhatsApp Lead Nurturing Bot",
    description: "Qualify leads and book appointments through WhatsApp",
    active: true,
  },
  // Add more workflows here as needed
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Workflows</h1>
        <p className="text-muted-foreground">
          Manage your automation workflows
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {workflows.map((workflow) => (
          <Link key={workflow.id} href={`/dashboard/${workflow.id}`}>
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{workflow.name}</CardTitle>
                  <span className={`h-2 w-2 rounded-full ${workflow.active ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                </div>
                <CardDescription>{workflow.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-sm text-muted-foreground">
                  {workflow.active ? 'Active' : 'Inactive'}
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
