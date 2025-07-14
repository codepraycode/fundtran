import { json2csv } from 'json-2-csv';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as ExcelJS from 'exceljs';

export const exportToCSV = async (data: any[]): Promise<string> => {
  return new Promise((resolve, reject) => {

    try {

        const csv = json2csv(data);
        resolve(csv);
    } catch(err){
        reject(err);
    }
  });
};

export const exportToPDF = async (data: any[]): Promise<Buffer> => {
  const doc = new jsPDF();
  
  const headers = Object.keys(data[0] || {});
  const rows = data.map(item => Object.values(item));
  
  (doc as any).autoTable({
    head: [headers],
    body: rows
  });
  
  return Buffer.from(doc.output('arraybuffer'));
};

export const exportToExcel = async (data: any[]): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Transactions');
  
  if (data.length > 0) {
    worksheet.columns = Object.keys(data[0]).map(key => ({
      header: key,
      key,
      width: 20
    }));
    
    worksheet.addRows(data);
  }
  
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};