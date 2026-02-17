import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function OnboardingPage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Partner Onboarding</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Onboarding flow will be implemented here.</p>
                </CardContent>
            </Card>
        </div>
    )
}
