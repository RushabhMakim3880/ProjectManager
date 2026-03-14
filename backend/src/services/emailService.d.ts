export declare function sendEmail(to: string | string[], subject: string, html: string): Promise<void>;
export declare function notifyTaskAssigned(task: any, project: any): Promise<void>;
export declare function notifyTaskReassigned(task: any, project: any, previousAssigneeName: string): Promise<void>;
export declare function notifyTaskCompleted(task: any, project: any, completedByName: string): Promise<void>;
export declare function notifyTaskComment(task: any, project: any, commenter: string, comment: any): Promise<void>;
export declare function notifyPayoutFinalized(project: any, payouts: any[]): Promise<void>;
declare const _default: {
    notifyTaskAssigned: typeof notifyTaskAssigned;
    notifyTaskReassigned: typeof notifyTaskReassigned;
    notifyTaskCompleted: typeof notifyTaskCompleted;
    notifyTaskComment: typeof notifyTaskComment;
    notifyPayoutFinalized: typeof notifyPayoutFinalized;
};
export default _default;
//# sourceMappingURL=emailService.d.ts.map