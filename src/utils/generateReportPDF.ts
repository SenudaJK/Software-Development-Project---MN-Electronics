import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ReportBranding {
  title: string;
  logo?: HTMLImageElement;
}

const companyInfo = {
  name: "MN Electronics",
  address: "1B, Jayathilaka Road, Panadura.",
  phone: "0712302138"
};

export const generateReportPDF = async (
  reportElement: HTMLElement,
  reportType: string,
  reportBranding?: ReportBranding
) => {
  try {
    // Create a new PDF document
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Set initial y position after header
    let yPos = 20;
    
    // Add company branding header
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(companyInfo.name, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 8;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(companyInfo.address, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5;
    pdf.text(companyInfo.phone, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    
    // Add report title
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(reportType + ' Report', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 5;
    
    // Add date and time
    const dateTime = new Date().toLocaleString();
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'italic');
    pdf.text('Generated on: ' + dateTime, pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 10;
    
    // Draw a line under the header
    pdf.setLineWidth(0.5);
    pdf.line(10, yPos, pageWidth - 10, yPos);
    
    yPos += 10;    // Before capturing, temporarily hide buttons and controls
    const buttonsToHide = reportElement.querySelectorAll('button, input[type="date"], .print-hide');
    const hiddenElements: Array<{element: Element, originalDisplay: string}> = [];
    
    // Store original display values and hide elements
    buttonsToHide.forEach(element => {
      hiddenElements.push({
        element,
        originalDisplay: (element as HTMLElement).style.display
      });
      (element as HTMLElement).style.display = 'none';
    });
    
    // Capture the report content as an image
    const canvas = await html2canvas(reportElement, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
    });
    
    // Restore original display values
    hiddenElements.forEach(({ element, originalDisplay }) => {
      (element as HTMLElement).style.display = originalDisplay;
    });
    
    const imgData = canvas.toDataURL('image/png');
    
    // Calculate image dimensions to fit page width while maintaining aspect ratio
    const imgWidth = pageWidth - 20; // 10mm margin on each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Add the image to the PDF
    pdf.addImage(imgData, 'PNG', 10, yPos, imgWidth, imgHeight);
    
    // Add page numbers if content spans multiple pages
    const totalPages = Math.ceil((yPos + imgHeight) / pageHeight);
    
    if (totalPages > 1) {
      for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i);
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 5, { align: 'center' });
      }
    }
    
    // Add footer with creator info
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text('MN Electronics Management System', 10, pageHeight - 5);
    pdf.text('www.mnelectronics.com', pageWidth - 10, pageHeight - 5, { align: 'right' });
    
    // Save the PDF with a filename based on the report type and date
    const fileName = `${reportType.toLowerCase().replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
    
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};
