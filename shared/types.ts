export type UserRole = 'ADMIN' | 'PARTNER';

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
}

export interface Partner {
    id: string;
    userId: string;
    user: User;
    specialization?: string;
    isEquityPartner: boolean;
    equityPercentage?: number;
    canViewFinancials: boolean;
    canManageProjects: boolean;
    canLogTasks: boolean;
}

export type ProjectStatus = 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
export type ProjectPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface Project {
    id: string;
    name: string;
    clientName: string;
    totalValue: number;
    startDate: Date;
    endDate?: Date;
    description?: string;
    status: ProjectStatus;
    priority: ProjectPriority;
    isLocked: boolean;
    weights: string; // JSON string
}

export type TaskStatus = 'BACKLOG' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';

export interface TaskComment {
    id: string;
    taskId: string;
    userId: string;
    user: User;
    content: string;
    type: 'COMMENT' | 'REVIEW';
    createdAt: Date;
}

export interface Task {
    id: string;
    projectId: string;
    name: string;
    category: string;
    effortWeight: number;
    assignedPartnerId?: string;
    assignedPartner?: Partner;
    timeSpent: number;
    completionPercent: number;
    status: TaskStatus;
    completedById?: string;
    completedBy?: User;
    completedAt?: Date;
    comments?: TaskComment[];
}
