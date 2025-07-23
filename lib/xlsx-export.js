import ExcelJS from 'exceljs';

export async function exportToXLSX(data, filename) {
	if (!data || data.length === 0) {
		console.error("No data to export");
		return;
	}

	const workbook = new ExcelJS.Workbook();
	const worksheet = workbook.addWorksheet('Meetings');

	const allKeys = new Set();
	data.forEach(row => {
		Object.keys(row).forEach(key => allKeys.add(key));
	});
	const headers = Array.from(allKeys);
	
	const headerRow = worksheet.addRow(headers);
	
	data.forEach(row => {
		worksheet.addRow(headers.map(header => row[header]));
	});

	headers.forEach((header, i) => {
		const maxLength = Math.max(
			header.length,
			...data.map(row => (row[header] || '').toString().length)
		);
		worksheet.getColumn(i + 1).width = maxLength + 2;
	});

	headerRow.eachCell((cell, colNumber) => {
		cell.font = { 
			bold: true, 
			color: { argb: 'FFFFFFFF' }
		};
		cell.fill = {
			type: 'pattern',
			pattern: 'solid',
			fgColor: { argb: 'FFB1A0C7' }
		};
		cell.alignment = { 
			horizontal: 'center', 
			vertical: 'middle' 
		};
		cell.border = {
			top: { style: 'thin' },
			left: { style: 'thin' },
			bottom: { style: 'thin' },
			right: { style: 'thin' }
		};
	});

	for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber++) {
		const row = worksheet.getRow(rowNumber);
		const isEvenRow = rowNumber % 2 === 0;
		
		for (let colNumber = 1; colNumber <= headers.length; colNumber++) {
			const cell = row.getCell(colNumber);

			cell.alignment = { 
				vertical: 'middle', 
				wrapText: true 
			};
			cell.border = {
				top: { style: 'thin', color: { argb: 'FFE5E7EB' } },
				left: { style: 'thin', color: { argb: 'FFE5E7EB' } },
				bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } },
				right: { style: 'thin', color: { argb: 'FFE5E7EB' } }
			};
			
			if (isEvenRow) {
				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: 'FFE4E4E4' }
				};
			} else {
				cell.fill = {
					type: 'pattern',
					pattern: 'solid',
					fgColor: { argb: 'FFFFFFFF' }
				};
			}
		}
	}

	try {
		const buffer = await workbook.xlsx.writeBuffer();
		
		const blob = new Blob([buffer], {
			type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		});
		
		const url = window.URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${filename}.xlsx`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		window.URL.revokeObjectURL(url);
		
		console.log('Archivo exportado exitosamente');
	} catch (error) {
		console.error('Error al exportar:', error);
	}
}