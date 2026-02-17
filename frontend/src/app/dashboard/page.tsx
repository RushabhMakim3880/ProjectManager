"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton-loader";
import { fetchCompanySummary, fetchProjects, FinancialSummary, ProjectSummary } from '@/lib/api';
import { BadgeDollarSign, Briefcase, TrendingUp, Users } from 'lucide-react';

export default function DashboardPage() {
    const [summary, setSummary] = useState<FinancialSummary | null>(null);
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [summaryData, projectsData] = await Promise.all([
                    fetchCompanySummary(),
                    fetchProjects()
                ]);
                setSummary(summaryData);
                // Sort by date (descending) and take top 5
                const sortedProjects = projectsData.sort((a, b) =>
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                ).slice(0, 5);
                setProjects(sortedProjects);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
                setError("Failed to load dashboard data. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error) {
        return <div className="p-6 text-destructive">{error}</div>;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold tracking-tight">Overview</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Revenue"
                    value={`₹${summary?.financials.totalRevenue.toLocaleString()}`}
                    description="+15% from last month"
                    icon={<BadgeDollarSign className="h-4 w-4 text-muted-foreground" />}
                />
                <MetricCard
                    title="Net Profit"
                    value={`₹${summary?.financials.netProfit.toLocaleString()}`}
                    description="After all expenses"
                    icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
                />
                <MetricCard
                    title="Active Projects"
                    value={summary?.projects.active.toString() || "0"}
                    description={`${summary?.projects.completed} completed total`}
                    icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
                />
                <MetricCard
                    title="Active Partners"
                    value={summary?.equity.length.toString() || "0"}
                    description="Currently contributing"
                    icon={<Users className="h-4 w-4 text-muted-foreground" />}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Recent Projects</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {projects.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No recent projects found.</p>
                            ) : (
                                projects.map(project => (
                                    <div key={project.id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                                        <div>
                                            <p className="font-medium">{project.name}</p>
                                            <p className="text-sm text-muted-foreground">{project.clientName}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-medium">₹{project.totalValue.toLocaleString()}</p>
                                            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Equity Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {summary?.equity.map(partner => (
                                <div key={partner.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                            {partner.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{partner.name}</p>
                                            <p className="text-xs text-muted-foreground">₹{partner.totalContributed.toLocaleString()} invested</p>
                                        </div>
                                    </div>
                                    <div className="font-bold text-sm">
                                        {partner.equity.toFixed(1)}%
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MetricCard({ title, value, description, icon }: { title: string, value: string, description: string, icon: React.ReactNode }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}

function getStatusColor(status: string) {
    switch (status) {
        case 'ACTIVE': return 'bg-green-500/10 text-green-500';
        case 'COMPLETED': return 'bg-blue-500/10 text-blue-500';
        case 'ON_HOLD': return 'bg-yellow-500/10 text-yellow-500';
        default: return 'bg-gray-500/10 text-gray-500';
    }
}

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            <Skeleton className="h-10 w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Skeleton className="col-span-4 h-96 rounded-lg" />
                <Skeleton className="col-span-3 h-96 rounded-lg" />
            </div>
        </div>
    )
}
