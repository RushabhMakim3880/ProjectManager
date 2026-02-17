"use client";

import { useEffect, useState } from 'react';
import { fetchPartners, deletePartner, Partner } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Trash2, Shield, User as UserIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const loadPartners = async () => {
        try {
            const data = await fetchPartners();
            setPartners(data);
        } catch (error) {
            console.error("Failed to fetch partners", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPartners();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to remove this partner? This action cannot be undone.")) {
            try {
                await deletePartner(id);
                loadPartners(); // Reload list
            } catch (error) {
                console.error("Failed to delete partner", error);
                alert("Failed to delete partner");
            }
        }
    };

    if (loading) {
        return <PartnersSkeleton />;
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Partner Management</h1>
                    <p className="text-muted-foreground">Manage authorized partners and their roles.</p>
                </div>
                <Button onClick={() => router.push('/dashboard/settings')}>
                    Invite Partner
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Authorized Partners</CardTitle>
                    <CardDescription>
                        List of all users with partner access to the platform.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Equity</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {partners.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                        No partners found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                partners.map((p) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                                <UserIcon className="h-4 w-4 text-primary" />
                                            </div>
                                            {p.user.name}
                                        </TableCell>
                                        <TableCell>{p.user.email}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {p.user.role === 'ADMIN' && <Shield className="h-3 w-3 text-purple-500" />}
                                                {p.user.role}
                                            </div>
                                        </TableCell>
                                        <TableCell>{p.partnerType}</TableCell>
                                        <TableCell>{p.equityPercentage}%</TableCell>
                                        <TableCell>
                                            <Badge variant={p.user.isActive ? 'default' : 'secondary'}>
                                                {p.user.accountStatus}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                onClick={() => handleDelete(p.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}

function PartnersSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
            </div>
            <Skeleton className="h-96 w-full" />
        </div>
    )
}
