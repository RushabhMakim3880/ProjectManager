-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "role" TEXT NOT NULL DEFAULT 'PARTNER',
    "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE',
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "loginStartDate" DATETIME,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "emergencyContact" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "partnerType" TEXT NOT NULL DEFAULT 'NON_EQUITY',
    "commissionRate" REAL NOT NULL DEFAULT 0,
    "skills" TEXT,
    "isEquity" BOOLEAN NOT NULL DEFAULT false,
    "hasVotingRights" BOOLEAN NOT NULL DEFAULT false,
    "canApprovePayouts" BOOLEAN NOT NULL DEFAULT false,
    "canFinalizeContribution" BOOLEAN NOT NULL DEFAULT false,
    "canEditFinancials" BOOLEAN NOT NULL DEFAULT false,
    "canCreateProjects" BOOLEAN NOT NULL DEFAULT false,
    "equityPercentage" REAL NOT NULL DEFAULT 0,
    "isBaseShareEligible" BOOLEAN NOT NULL DEFAULT true,
    "baseShareDecayEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isIncludedInPerformancePool" BOOLEAN NOT NULL DEFAULT true,
    "isIncludedInBasePool" BOOLEAN NOT NULL DEFAULT true,
    "defaultContributionWeight" REAL NOT NULL DEFAULT 1,
    "totalCapitalContributed" REAL NOT NULL DEFAULT 0,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "ifscSwift" TEXT,
    "upiId" TEXT,
    "payoutMethod" TEXT DEFAULT 'BANK_TRANSFER',
    "taxIdPan" TEXT,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "hasRevenueVisibility" BOOLEAN NOT NULL DEFAULT false,
    "defaultProjectRole" TEXT,
    "canLeadProjects" BOOLEAN NOT NULL DEFAULT false,
    "canHandleClientComms" BOOLEAN NOT NULL DEFAULT false,
    "canApproveScope" BOOLEAN NOT NULL DEFAULT false,
    "canLogTasks" BOOLEAN NOT NULL DEFAULT true,
    "canEditOwnLogs" BOOLEAN NOT NULL DEFAULT true,
    "canEditOthersLogs" BOOLEAN NOT NULL DEFAULT false,
    "canViewContributionBreakdown" BOOLEAN NOT NULL DEFAULT true,
    "canOverrideContribution" BOOLEAN NOT NULL DEFAULT false,
    "agreementAccepted" BOOLEAN NOT NULL DEFAULT false,
    "digitalSignature" TEXT,
    "dateAccepted" DATETIME,
    "agreementVersionId" TEXT,
    "joinDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveDate" DATETIME,
    "performanceTrackingEnabled" BOOLEAN NOT NULL DEFAULT true,
    "baseShareEligibilityStartDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalEarnings" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "totalValue" REAL NOT NULL,
    "netProfit" REAL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "closedAt" DATETIME,
    "description" TEXT,
    "projectIdCustom" TEXT,
    "projectType" TEXT,
    "category" TEXT,
    "priority" TEXT DEFAULT 'MEDIUM',
    "clientContact" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "whatsappNumber" TEXT,
    "commsChannel" TEXT,
    "timezone" TEXT,
    "location" TEXT,
    "ndaSigned" BOOLEAN NOT NULL DEFAULT false,
    "ndaFile" TEXT,
    "contractFile" TEXT,
    "internalDeadline" DATETIME,
    "clientDeadline" DATETIME,
    "objectives" TEXT,
    "deliverables" TEXT,
    "outOfScope" TEXT,
    "techStack" TEXT,
    "environments" TEXT,
    "accessReqs" TEXT,
    "dependencies" TEXT,
    "riskLevel" TEXT DEFAULT 'LOW',
    "githubUrl" TEXT,
    "projectLeadId" TEXT,
    "techLeadId" TEXT,
    "commsLeadId" TEXT,
    "qaLeadId" TEXT,
    "salesOwnerId" TEXT,
    "salesPartnerId" TEXT,
    "salesCommissionAmount" REAL NOT NULL DEFAULT 0,
    "enableContributionTracking" BOOLEAN NOT NULL DEFAULT true,
    "enableTaskLogging" BOOLEAN NOT NULL DEFAULT true,
    "effortScale" TEXT DEFAULT 'FIBONACCI',
    "timeTrackingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "approvalRequired" BOOLEAN NOT NULL DEFAULT false,
    "visibility" TEXT NOT NULL DEFAULT 'INTERNAL',
    "canEdit" TEXT,
    "canAddTasks" TEXT,
    "canFinalize" TEXT,
    "autoLock" BOOLEAN NOT NULL DEFAULT true,
    "specialInstructions" TEXT,
    "riskNotes" TEXT,
    "clientConstraints" TEXT,
    "escalationContact" TEXT,
    "internalRemarks" TEXT,
    "clientId" TEXT,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_salesPartnerId_fkey" FOREIGN KEY ("salesPartnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Project_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjectDocument_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "category" TEXT,
    "method" TEXT NOT NULL,
    "transactionId" TEXT,
    "description" TEXT,
    "fileKey" TEXT,
    "receiptData" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Transaction_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "deliverables" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Milestone_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "effortWeight" REAL NOT NULL DEFAULT 1,
    "assignedPartnerId" TEXT,
    "timeSpent" REAL NOT NULL DEFAULT 0,
    "completionPercent" REAL NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'BACKLOG',
    "completedById" TEXT,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Task_assignedPartnerId_fkey" FOREIGN KEY ("assignedPartnerId") REFERENCES "Partner" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Task_completedById_fkey" FOREIGN KEY ("completedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskComment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COMMENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Contribution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Contribution_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Contribution_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdvancePayout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL,
    "referenceId" TEXT,
    "notes" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AdvancePayout_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdvancePayout_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "AdvancePayout_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Financial" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "businessReserve" REAL NOT NULL,
    "religiousAllocation" REAL NOT NULL,
    "netDistributable" REAL NOT NULL,
    "basePool" REAL NOT NULL,
    "performancePool" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Financial_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "baseShare" REAL NOT NULL,
    "performanceShare" REAL NOT NULL,
    "fixedCommission" REAL NOT NULL DEFAULT 0,
    "advanceDeduction" REAL NOT NULL DEFAULT 0,
    "totalPayout" REAL NOT NULL,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "payoutDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payout_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Payout_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AgreementVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT,
    "details" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'PARTNER',
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "partnerType" TEXT NOT NULL DEFAULT 'NON_EQUITY',
    "isEquity" BOOLEAN NOT NULL DEFAULT false,
    "equityPercentage" REAL NOT NULL DEFAULT 0,
    "invitedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'SYSTEM',
    "companyName" TEXT NOT NULL DEFAULT 'Strategic Cyber Security',
    "companyAddress" TEXT,
    "companyDescription" TEXT,
    "companyLogo" TEXT,
    "companyEmail" TEXT,
    "companyPhone" TEXT,
    "companyWebsite" TEXT,
    "companyTaxId" TEXT,
    "bankName" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankIfsc" TEXT,
    "bankSwift" TEXT,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CapitalInjection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "equityDelta" REAL NOT NULL,
    "postEquity" REAL NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CapitalInjection_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ClientProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "industry" TEXT,
    "website" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ClientProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Enquiry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enquiryId" TEXT NOT NULL,
    "clientName" TEXT NOT NULL,
    "companyName" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "country" TEXT,
    "servicesRequested" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'NEW',
    "estimatedValue" REAL,
    "probability" INTEGER DEFAULT 0,
    "discoveryData" TEXT,
    "projectId" TEXT,
    "clientId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Enquiry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Enquiry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Quotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enquiryId" TEXT NOT NULL,
    "title" TEXT,
    "totalAmount" REAL NOT NULL,
    "taxAmount" REAL,
    "subtotal" REAL,
    "discount" REAL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "validUntil" DATETIME,
    "lineItems" TEXT NOT NULL,
    "optionalItems" TEXT,
    "fileKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Quotation_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Proposal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enquiryId" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "fileKey" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "signature" TEXT,
    "signedAt" DATETIME,
    "signedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Proposal_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EnquiryNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "enquiryId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EnquiryNote_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "EnquiryNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "companyName" TEXT,
    "website" TEXT,
    "email" TEXT,
    "industry" TEXT,
    "description" TEXT,
    "servicesRequested" TEXT NOT NULL,
    "fitScore" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'DISCOVERED',
    "emailSentAt" DATETIME,
    "responseReceivedAt" DATETIME,
    "enquiryId" TEXT,
    "discoveredById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Lead_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lead_discoveredById_fkey" FOREIGN KEY ("discoveredById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'COLD_OUTREACH',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_userId_key" ON "Partner"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectIdCustom_key" ON "Project"("projectIdCustom");

-- CreateIndex
CREATE UNIQUE INDEX "Contribution_projectId_partnerId_key" ON "Contribution"("projectId", "partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_token_key" ON "Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ClientProfile_userId_key" ON "ClientProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_enquiryId_key" ON "Enquiry"("enquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "Enquiry_projectId_key" ON "Enquiry"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_enquiryId_key" ON "Lead"("enquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailTemplate_name_key" ON "EmailTemplate"("name");
