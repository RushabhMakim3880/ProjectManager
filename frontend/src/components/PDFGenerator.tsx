// @ts-nocheck
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
    page: {
        flexDirection: 'column',
        backgroundColor: '#FFFFFF',
        padding: 40,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottom: 1,
        borderBottomColor: '#EEEEEE',
        paddingBottom: 20,
    },
    companyInfo: {
        flexDirection: 'column',
    },
    companyName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
    },
    companyDetail: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 2,
    },
    logo: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginBottom: 8,
    },
    headerRight: {
        flexDirection: 'column',
        alignItems: 'flex-end',
    },
    docType: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    docDate: {
        fontSize: 10,
        color: '#6B7280',
        marginTop: 4,
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#374151',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 8,
        borderBottom: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 4,
    },
    text: {
        fontSize: 10,
        color: '#4B5563',
        lineHeight: 1.5,
    },
    table: {
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden',
    },
    tableHeaderRow: {
        flexDirection: 'row',
        backgroundColor: '#F9FAFB',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tableHeaderCell: {
        fontSize: 9,
        fontWeight: 'bold',
        color: '#374151',
        padding: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    tableCell: {
        fontSize: 9,
        color: '#374151',
        padding: 8,
    },
    totalsContainer: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalsBox: {
        width: 180,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    totalLabel: {
        fontSize: 10,
        color: '#6B7280',
    },
    totalValue: {
        fontSize: 10,
        color: '#111827',
        fontWeight: 'bold',
    },
    grandTotalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#4F46E5',
    },
    grandTotalLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#111827',
    },
    grandTotalValue: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
    footerContainer: {
        position: 'absolute',
        bottom: 30,
        left: 40,
        right: 40,
        borderTop: 1,
        borderTopColor: '#EEEEEE',
        paddingTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 8,
        color: '#9CA3AF',
    },
    footerBrand: {
        fontSize: 8,
        fontWeight: 'bold',
        color: '#4F46E5',
    },
});

interface PDFData {
    title: string;
    lineItems?: any[];   // Quotation line items (from API)
    content?: any[];    // Proposal sections (from API, already parsed)
    subtotal?: number;
    taxAmount?: number;
    discount?: number;
    totalAmount?: number;
    currency?: string;
    validUntil?: string;
}

export const DocumentPDF = ({ data, settings, type }: { data: PDFData, settings: any, type: 'QUOTATION' | 'PROPOSAL' }) => (
    <Document {...({} as any)}>
        <Page size="A4" style={styles.page} {...({} as any)}>
            {/* Header */}
            <View style={styles.header} {...({} as any)}>
                <View style={styles.companyInfo} {...({} as any)}>
                    {settings.companyLogo && <Image src={settings.companyLogo} style={styles.logo} {...({} as any)} />}
                    <Text style={styles.companyName} {...({} as any)}>{settings.companyName || 'Agency OS'}</Text>
                    <Text style={styles.companyDetail} {...({} as any)}>{settings.companyAddress}</Text>
                    <Text style={styles.companyDetail} {...({} as any)}>{settings.companyEmail} • {settings.companyPhone}</Text>
                </View>
                <View style={styles.headerRight} {...({} as any)}>
                    <Text style={styles.docType} {...({} as any)}>{type}</Text>
                    <Text style={styles.docDate} {...({} as any)}>Date: {new Date().toLocaleDateString()}</Text>
                    {data.validUntil && (
                        <Text style={[styles.companyDetail, { color: '#EF4444', fontWeight: 'bold' }]} {...({} as any)}>
                            Valid Until: {new Date(data.validUntil).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </View>

            {/* Content for Quotation */}
            {type === 'QUOTATION' && data.lineItems && (
                <View style={styles.section} {...({} as any)}>
                    <Text style={styles.sectionTitle} {...({} as any)}>Project Estimation & Pricing</Text>
                    <View style={styles.table} {...({} as any)}>
                        <View style={styles.tableHeaderRow} {...({} as any)}>
                            <View style={{ width: '45%' }} {...({} as any)}><Text style={styles.tableHeaderCell} {...({} as any)}>Description</Text></View>
                            <View style={{ width: '15%' }} {...({} as any)}><Text style={[styles.tableHeaderCell, { textAlign: 'center' }]} {...({} as any)}>Qty</Text></View>
                            <View style={{ width: '20%' }} {...({} as any)}><Text style={[styles.tableHeaderCell, { textAlign: 'right' }]} {...({} as any)}>Unit Price</Text></View>
                            <View style={{ width: '20%' }} {...({} as any)}><Text style={[styles.tableHeaderCell, { textAlign: 'right' }]} {...({} as any)}>Amount</Text></View>
                        </View>
                        {data.lineItems.map((item, i) => (
                            <View key={i} style={styles.tableRow} {...({} as any)}>
                                <View style={{ width: '45%' }} {...({} as any)}><Text style={styles.tableCell} {...({} as any)}>{item.description}</Text></View>
                                <View style={{ width: '15%' }} {...({} as any)}><Text style={[styles.tableCell, { textAlign: 'center' }]} {...({} as any)}>{item.quantity}</Text></View>
                                <View style={{ width: '20%' }} {...({} as any)}><Text style={[styles.tableCell, { textAlign: 'right' }]} {...({} as any)}>{data.currency} {Number(item.unitPrice).toLocaleString()}</Text></View>
                                <View style={{ width: '20%' }} {...({} as any)}><Text style={[styles.tableCell, { textAlign: 'right', fontWeight: 'bold' }]} {...({} as any)}>{data.currency} {(item.quantity * item.unitPrice).toLocaleString()}</Text></View>
                            </View>
                        ))}
                    </View>

                    <View style={styles.totalsContainer} {...({} as any)}>
                        <View style={styles.totalsBox} {...({} as any)}>
                            <View style={styles.totalRow} {...({} as any)}>
                                <Text style={styles.totalLabel} {...({} as any)}>Subtotal:</Text>
                                <Text style={styles.totalValue} {...({} as any)}>{data.currency} {data.subtotal?.toLocaleString()}</Text>
                            </View>
                            {data.taxAmount && data.taxAmount > 0 && (
                                <View style={styles.totalRow} {...({} as any)}>
                                    <Text style={styles.totalLabel} {...({} as any)}>Tax:</Text>
                                    <Text style={styles.totalValue} {...({} as any)}>{data.currency} {data.taxAmount.toLocaleString()}</Text>
                                </View>
                            )}
                            {data.discount && data.discount > 0 && (
                                <View style={styles.totalRow} {...({} as any)}>
                                    <Text style={styles.totalLabel} {...({} as any)}>Discount:</Text>
                                    <Text style={[styles.totalValue, { color: '#10B981' }]} {...({} as any)}>- {data.currency} {data.discount.toLocaleString()}</Text>
                                </View>
                            )}
                            <View style={styles.grandTotalRow} {...({} as any)}>
                                <Text style={styles.grandTotalLabel} {...({} as any)}>Total Amount:</Text>
                                <Text style={styles.grandTotalValue} {...({} as any)}>{data.currency} {data.totalAmount?.toLocaleString()}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

            {/* Content for Proposal */}
            {type === 'PROPOSAL' && data.content && (
                <View {...({} as any)}>
                    <Text style={[styles.docType, { fontSize: 20, color: '#111827', marginBottom: 30 }]} {...({} as any)}>{data.title}</Text>
                    {data.content.map((section: any, idx: number) => (
                        <View key={idx} style={styles.section} {...({} as any)}>
                            <Text style={styles.sectionTitle} {...({} as any)}>{section.title}</Text>
                            <Text style={styles.text} {...({} as any)}>{section.content}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* Bank Details in Quotation */}
            {type === 'QUOTATION' && settings.bankName && (
                <View style={[styles.section, { marginTop: 20, padding: 15, backgroundColor: '#F3F4F6', borderRadius: 8 }]} {...({} as any)}>
                    <Text style={[styles.sectionTitle, { backgroundColor: 'transparent', padding: 0 }]} {...({} as any)}>Payment Instructions</Text>
                    <View style={{ flexDirection: 'row', marginTop: 8 }} {...({} as any)}>
                        <View style={{ width: '50%' }} {...({} as any)}>
                            <Text style={[styles.companyDetail, { fontWeight: 'bold' }]} {...({} as any)}>Bank Name:</Text>
                            <Text style={styles.companyDetail} {...({} as any)}>{settings.bankName}</Text>
                        </View>
                        <View style={{ width: '50%' }} {...({} as any)}>
                            <Text style={[styles.companyDetail, { fontWeight: 'bold' }]} {...({} as any)}>Account Number:</Text>
                            <Text style={styles.companyDetail} {...({} as any)}>{settings.bankAccountNumber}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', marginTop: 10 }} {...({} as any)}>
                        <View style={{ width: '50%' }} {...({} as any)}>
                            <Text style={[styles.companyDetail, { fontWeight: 'bold' }]} {...({} as any)}>Account Holder:</Text>
                            <Text style={styles.companyDetail} {...({} as any)}>{settings.bankAccountName}</Text>
                        </View>
                        <View style={{ width: '50%' }} {...({} as any)}>
                            <Text style={[styles.companyDetail, { fontWeight: 'bold' }]} {...({} as any)}>IFSC Code:</Text>
                            <Text style={styles.companyDetail} {...({} as any)}>{settings.bankIfsc || settings.bankSwift}</Text>
                        </View>
                    </View>
                </View>
            )}

            {/* Footer */}
            <View style={styles.footerContainer} {...({} as any)}>
                <Text style={styles.footerText} {...({} as any)}>{settings.companyWebsite || 'www.agencyos.com'}</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }} {...({} as any)}>
                    <Text style={styles.footerText} {...({} as any)}>Generated by </Text>
                    <Text style={styles.footerBrand} {...({} as any)}>Agency OS</Text>
                    <Text style={styles.footerText} {...({} as any)}> | Page 1 of 1</Text>
                </View>
            </View>
        </Page>
    </Document>
);
