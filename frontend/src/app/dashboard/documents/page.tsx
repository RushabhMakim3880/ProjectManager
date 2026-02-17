import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DocumentsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Document Generator</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Document templates and generation will be implemented here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
