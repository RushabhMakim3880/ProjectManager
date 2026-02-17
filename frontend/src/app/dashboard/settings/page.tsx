import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Profile & Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Settings configuration will be implemented here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
