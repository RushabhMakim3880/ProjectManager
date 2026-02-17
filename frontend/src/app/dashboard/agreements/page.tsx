import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AgreementsPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Agreements</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Agreements & Contracts</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Agreement management will be implemented here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
