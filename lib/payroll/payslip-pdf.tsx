import React from 'react';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Helvetica', color: '#172033', fontSize: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: 2, borderBottomColor: '#2563eb', paddingBottom: 16, marginBottom: 18 },
  title: { fontSize: 22, fontFamily: 'Helvetica-Bold', color: '#172033' },
  subtitle: { color: '#64748b', marginTop: 4 },
  sectionTitle: { fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#2563eb', marginBottom: 8, textTransform: 'uppercase' },
  details: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: '#f8fafc', padding: 12, marginBottom: 18 },
  detail: { width: '50%', marginBottom: 8 },
  label: { color: '#64748b', fontSize: 8, marginBottom: 2 },
  value: { fontFamily: 'Helvetica-Bold' },
  columns: { flexDirection: 'row', gap: 14 },
  column: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', borderBottom: 1, borderBottomColor: '#e2e8f0', paddingVertical: 7 },
  lineName: { flex: 1 },
  amount: { width: 90, textAlign: 'right' },
  empty: { color: '#94a3b8', paddingVertical: 7 },
  totals: { marginTop: 22, marginLeft: '50%', borderTop: 1, borderTopColor: '#cbd5e1', paddingTop: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  gross: { fontFamily: 'Helvetica-Bold' },
  net: { backgroundColor: '#172033', color: '#ffffff', padding: 10, marginTop: 6, fontSize: 14, fontFamily: 'Helvetica-Bold' },
  footer: { position: 'absolute', bottom: 24, left: 36, right: 36, color: '#94a3b8', fontSize: 8, textAlign: 'center' }
});

type PayslipPdfData = {
  employee: { firstName: string; lastName: string; employeeCode: string; designation?: string | null; workEmail: string };
  payrollRun: { month: number; year: number; periodStart: Date; periodEnd: Date };
  workedDays: number;
  totalWorkingDays: number;
  lines: { name: string; category: string; amount: number; sequence: number }[];
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
};

const currency = (amount: number) => `INR ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const monthName = (month: number) => new Date(2000, month - 1).toLocaleString('en-IN', { month: 'long' });

export function PayslipDocument({ payslip }: { payslip: PayslipPdfData }) {
  const deductions = payslip.lines.filter(line => line.category.toLowerCase() === 'deduction');
  const earnings = payslip.lines.filter(line => line.category.toLowerCase() !== 'deduction');
  const employeeName = `${payslip.employee.firstName} ${payslip.employee.lastName}`;
  const lineGroup = (title: string, lines: PayslipPdfData['lines']) => (
    <View style={styles.column}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {lines.length === 0 ? <Text style={styles.empty}>No items</Text> : lines.map(line => (
        <View style={styles.row} key={`${line.category}-${line.sequence}-${line.name}`}>
          <Text style={styles.lineName}>{line.name}</Text>
          <Text style={styles.amount}>{currency(line.amount)}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <Document title={`Payslip - ${employeeName}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>PAYSLIP</Text>
            <Text style={styles.subtitle}>{monthName(payslip.payrollRun.month)} {payslip.payrollRun.year}</Text>
          </View>
          <Text style={styles.subtitle}>NexaHR</Text>
        </View>
        <Text style={styles.sectionTitle}>Employee details</Text>
        <View style={styles.details}>
          <View style={styles.detail}><Text style={styles.label}>Employee</Text><Text style={styles.value}>{employeeName}</Text></View>
          <View style={styles.detail}><Text style={styles.label}>Employee code</Text><Text style={styles.value}>{payslip.employee.employeeCode}</Text></View>
          <View style={styles.detail}><Text style={styles.label}>Designation</Text><Text style={styles.value}>{payslip.employee.designation || '-'}</Text></View>
          <View style={styles.detail}><Text style={styles.label}>Work email</Text><Text style={styles.value}>{payslip.employee.workEmail}</Text></View>
          <View style={styles.detail}><Text style={styles.label}>Pay period</Text><Text style={styles.value}>{payslip.payrollRun.periodStart.toLocaleDateString('en-IN')} - {payslip.payrollRun.periodEnd.toLocaleDateString('en-IN')}</Text></View>
          <View style={styles.detail}><Text style={styles.label}>Worked days</Text><Text style={styles.value}>{payslip.workedDays} / {payslip.totalWorkingDays}</Text></View>
        </View>
        <View style={styles.columns}>{lineGroup('Earnings', earnings)}{lineGroup('Deductions', deductions)}</View>
        <View style={styles.totals}>
          <View style={styles.totalRow}><Text>Gross pay</Text><Text style={styles.gross}>{currency(payslip.basicSalary + payslip.allowances)}</Text></View>
          <View style={styles.totalRow}><Text>Total deductions</Text><Text>{currency(payslip.deductions)}</Text></View>
          <View style={styles.totalRow}><Text style={styles.net}>Net pay</Text><Text style={styles.net}>{currency(payslip.netSalary)}</Text></View>
        </View>
        <Text style={styles.footer}>This is a system-generated payslip.</Text>
      </Page>
    </Document>
  );
}

export async function renderPayslipPdf(payslip: PayslipPdfData) {
  return renderToBuffer(<PayslipDocument payslip={payslip} />);
}