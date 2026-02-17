import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export interface FinancialSummary {
    financials: {
        totalRevenue: number;
        totalExpenses: number;
        netProfit: number;
        totalProjectValue: number;
    };
    projects: {
        total: number;
        active: number;
        completed: number;
    };
    equity: Array<{
        id: string;
        name: string;
        equity: number;
        totalContributed: number;
    }>;
}

export interface ProjectSummary {
    id: string;
    name: string;
    clientName: string;
    status: string;
    totalValue: number;
    startDate: string;
    endDate?: string;
    progress?: number; // Calculated on frontend or implied
}

export interface ProjectDetails extends ProjectSummary {
    description: string;
    clientContact?: string;
    clientEmail?: string;
    priority: string;
    category: string;
    createdAt: string;
    updatedAt: string;
    // Add other fields as needed
}

export interface Transaction {
    id: string;
    date: string;
    amount: number;
    type: 'INCOME' | 'EXPENSE';
    category: string;
    description: string;
    project: {
        name: string;
    };
}

export interface Partner {
    id: string;
    userId: string;
    equityPercentage: number;
    totalCapitalContributed: number;
    partnerType: string;
    joinDate: string;
    user: {
        name: string;
        email: string;
        role: string;
        accountStatus: string;
        isActive: boolean;
    };
}

export const fetchCompanySummary = async (): Promise<FinancialSummary> => {
    const response = await api.get('/finance/company-summary');
    return response.data;
};

export const fetchProjects = async (): Promise<ProjectSummary[]> => {
    const response = await api.get('/projects');
    return response.data;
};

export const fetchProjectById = async (id: string): Promise<ProjectDetails> => {
    const response = await api.get(`/projects/${id}`);
    return response.data;
};

export const fetchTransactions = async (): Promise<Transaction[]> => {
    const response = await api.get('/finance/transactions');
    return response.data;
};

export const fetchPartners = async (): Promise<Partner[]> => {
    const response = await api.get('/partners');
    return response.data;
};

export const deletePartner = async (id: string): Promise<void> => {
    await api.delete(`/partners/${id}`);
};

export default api;
