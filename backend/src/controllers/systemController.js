import {} from 'express';
import { prisma } from '../lib/prisma.js';
export const getSystemSettings = async (req, res) => {
    try {
        let settings = await prisma.systemSetting.findUnique({
            where: { id: 'SYSTEM' }
        });
        if (!settings) {
            settings = await prisma.systemSetting.create({
                data: { id: 'SYSTEM' }
            });
        }
        res.json(settings);
    }
    catch (error) {
        console.error('System settings fetch error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const updateSystemSettings = async (req, res) => {
    try {
        const { companyName, companyAddress, companyDescription, companyLogo, companyEmail, companyPhone, companyWebsite, companyTaxId, bankName, bankAccountName, bankAccountNumber, bankIfsc, bankSwift } = req.body;
        const settings = await prisma.systemSetting.upsert({
            where: { id: 'SYSTEM' },
            update: {
                companyName,
                companyAddress,
                companyDescription,
                companyLogo,
                companyEmail,
                companyPhone,
                companyWebsite,
                companyTaxId,
                bankName,
                bankAccountName,
                bankAccountNumber,
                bankIfsc,
                bankSwift
            },
            create: {
                id: 'SYSTEM',
                companyName,
                companyAddress,
                companyDescription,
                companyLogo,
                companyEmail,
                companyPhone,
                companyWebsite,
                companyTaxId,
                bankName,
                bankAccountName,
                bankAccountNumber,
                bankIfsc,
                bankSwift
            }
        });
        res.json(settings);
    }
    catch (error) {
        console.error('System settings update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=systemController.js.map