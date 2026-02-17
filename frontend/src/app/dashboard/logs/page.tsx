import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function LogsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
            <Card>
                <CardHeader>
                    <CardTitle>System Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Audit logs will be displayed here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
