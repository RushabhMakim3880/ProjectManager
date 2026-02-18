import nodemailer from 'nodemailer';
import { prisma } from '../lib/prisma.js';

// ─── SMTP Configuration ───
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@protrack.com';

// Check if email is configured
const isEmailConfigured = () => !!(process.env.SMTP_USER && process.env.SMTP_PASS);

// ─── Core Send Function ───
async function sendEmail(to: string | string[], subject: string, html: string) {
    if (!isEmailConfigured()) {
        console.log('[EMAIL] SMTP not configured, skipping email:', subject);
        return;
    }

    try {
        const recipients = Array.isArray(to) ? to.join(', ') : to;
        await transporter.sendMail({
            from: FROM,
            to: recipients,
            subject,
            html: wrapTemplate(subject, html),
        });
        console.log(`[EMAIL] Sent: "${subject}" → ${recipients}`);
    } catch (error) {
        console.error('[EMAIL] Failed to send:', error);
        // Don't throw — emails should never crash the app
    }
}

// ─── Get All Partner Emails ───
async function getAllPartnerEmails(): Promise<string[]> {
    const partners = await prisma.partner.findMany({
        where: { user: { isActive: true } },
        include: { user: { select: { email: true } } },
    });
    return partners.map(p => p.user.email).filter(Boolean);
}

// ─── Get Project Partner Emails ───
async function getProjectPartnerEmails(projectId: string): Promise<string[]> {
    const contributions = await prisma.contribution.findMany({
        where: { projectId },
        include: { partner: { include: { user: { select: { email: true } } } } },
    });
    return contributions.map(c => c.partner.user.email).filter(Boolean);
}

// ─── Notification Functions ───

export async function notifyTaskAssigned(task: any, project: any) {
    if (!task.assignedPartner?.user?.email) return;

    const email = task.assignedPartner.user.email;
    const assigneeName = task.assignedPartner.user.name;

    await sendEmail(
        email,
        `📋 New Task Assigned: ${task.name}`,
        `
        <p>Hi <strong>${assigneeName}</strong>,</p>
        <p>You have been assigned a new task on <strong>${project.name}</strong>:</p>
        ${taskCard(task)}
        <p style="color: #9ca3af; font-size: 13px;">Log in to your dashboard to view details and start working.</p>
        `
    );
}

export async function notifyTaskReassigned(task: any, project: any, previousAssigneeName: string) {
    if (!task.assignedPartner?.user?.email) return;

    const email = task.assignedPartner.user.email;
    const newAssigneeName = task.assignedPartner.user.name;

    await sendEmail(
        email,
        `🔄 Task Re-assigned to You: ${task.name}`,
        `
        <p>Hi <strong>${newAssigneeName}</strong>,</p>
        <p>A task on <strong>${project.name}</strong> has been re-assigned from <strong>${previousAssigneeName}</strong> to you:</p>
        ${taskCard(task)}
        <p style="color: #9ca3af; font-size: 13px;">Log in to your dashboard to view details.</p>
        `
    );
}

export async function notifyTaskCompleted(task: any, project: any, completedByName: string) {
    const emails = await getProjectPartnerEmails(project.id);
    if (emails.length === 0) return;

    await sendEmail(
        emails,
        `✅ Task Completed: ${task.name}`,
        `
        <p>A task on <strong>${project.name}</strong> has been marked as complete:</p>
        ${taskCard(task)}
        <p><strong>Completed by:</strong> ${completedByName}</p>
        <p style="color: #9ca3af; font-size: 13px;">Contribution percentages will update on the next recalculation.</p>
        `
    );
}

export async function notifyTaskComment(task: any, project: any, commenter: string, comment: any) {
    const emails = await getProjectPartnerEmails(project.id);
    if (emails.length === 0) return;

    const typeLabel = comment.type === 'REVIEW' ? '⭐ Review' : '💬 Comment';

    await sendEmail(
        emails,
        `${typeLabel} on Task: ${task.name}`,
        `
        <p><strong>${commenter}</strong> left a ${comment.type === 'REVIEW' ? 'review' : 'comment'} on a task in <strong>${project.name}</strong>:</p>
        ${taskCard(task)}
        <div style="background: #1e1e2e; border-left: 3px solid ${comment.type === 'REVIEW' ? '#f59e0b' : '#6366f1'}; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0;">
            <p style="color: #e5e7eb; margin: 0; font-size: 14px;">${comment.content}</p>
        </div>
        `
    );
}

export async function notifyPayoutFinalized(project: any, payouts: any[]) {
    for (const payout of payouts) {
        // Get partner email
        const partner = await prisma.partner.findUnique({
            where: { id: payout.partnerId },
            include: { user: { select: { email: true, name: true } } },
        });

        if (!partner?.user?.email) continue;

        await sendEmail(
            partner.user.email,
            `💰 Payout Finalized: ${project.name}`,
            `
            <p>Hi <strong>${partner.user.name}</strong>,</p>
            <p>Payouts for <strong>${project.name}</strong> have been finalized. Here's your breakdown:</p>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="border-bottom: 1px solid #374151;">
                    <td style="padding: 10px 16px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Base Share</td>
                    <td style="padding: 10px 16px; color: #e5e7eb; font-weight: bold; text-align: right;">₹${payout.baseShare?.toLocaleString() || '0'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #374151;">
                    <td style="padding: 10px 16px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Performance Share</td>
                    <td style="padding: 10px 16px; color: #f59e0b; font-weight: bold; text-align: right;">₹${payout.performanceShare?.toLocaleString() || '0'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 16px; color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Total Payout</td>
                    <td style="padding: 12px 16px; color: #ffffff; font-weight: 900; text-align: right; font-size: 18px;">₹${payout.amount?.toLocaleString() || '0'}</td>
                </tr>
            </table>
            <p style="color: #9ca3af; font-size: 13px;">This payout has been locked and recorded in the system.</p>
            `
        );
    }
}

// ─── HTML Template Helpers ───

function taskCard(task: any): string {
    const statusColor = task.status === 'DONE' ? '#10b981' : task.status === 'IN_PROGRESS' ? '#6366f1' : '#6b7280';
    return `
    <div style="background: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 16px 20px; margin: 16px 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <p style="color: #ffffff; font-weight: 700; font-size: 15px; margin: 0 0 6px 0;">${task.name}</p>
                <p style="color: #6b7280; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; margin: 0;">
                    ${task.category} &nbsp;·&nbsp; Effort: ${task.effortWeight}
                </p>
            </div>
            <span style="background: ${statusColor}20; color: ${statusColor}; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                ${task.status?.replace('_', ' ') || 'BACKLOG'}
            </span>
        </div>
    </div>
    `;
}

function wrapTemplate(title: string, body: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin: 0; padding: 0; background: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 560px; margin: 0 auto; padding: 40px 20px;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #ffffff; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 4px; margin: 0;">
                    CodeTech ProTrack
                </h1>
                <div style="width: 40px; height: 2px; background: #6366f1; margin: 12px auto 0;"></div>
            </div>

            <!-- Body -->
            <div style="background: #111827; border: 1px solid #1f2937; border-radius: 16px; padding: 32px; color: #d1d5db; font-size: 14px; line-height: 1.7;">
                ${body}
            </div>

            <!-- Footer -->
            <div style="text-align: center; margin-top: 32px;">
                <p style="color: #4b5563; font-size: 11px; text-transform: uppercase; letter-spacing: 2px;">
                    Automated notification · Do not reply
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
}

export default {
    notifyTaskAssigned,
    notifyTaskReassigned,
    notifyTaskCompleted,
    notifyTaskComment,
    notifyPayoutFinalized,
};
