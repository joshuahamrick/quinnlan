import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const LETTER_WIDTH_IN = 8.5;
const LETTER_HEIGHT_IN = 11;
const DPI = 96;
const MARGIN_IN = 0.25;

export async function exportToPng(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  element.classList.add('export-mode');
  try {
    const dataUrl = await toPng(element, { pixelRatio: 2 });
    const link = document.createElement('a');
    link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
    link.href = dataUrl;
    link.click();
  } finally {
    element.classList.remove('export-mode');
  }
}

export async function exportToPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  element.classList.add('export-mode');
  try {
    const dataUrl = await toPng(element, { pixelRatio: 2 });

    // Load the image to get dimensions
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Failed to load captured image'));
      img.src = dataUrl;
    });

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'in',
      format: 'letter',
    });

    const usableWidth = LETTER_WIDTH_IN - MARGIN_IN * 2;
    const usableHeight = LETTER_HEIGHT_IN - MARGIN_IN * 2;

    // Scale image to fit page width
    const imgAspect = img.height / img.width;
    const scaledWidth = usableWidth;
    const scaledHeight = usableWidth * imgAspect;

    if (scaledHeight <= usableHeight) {
      // Fits on one page
      pdf.addImage(dataUrl, 'PNG', MARGIN_IN, MARGIN_IN, scaledWidth, scaledHeight);
    } else {
      // Multi-page: slice the image across pages
      // We need to figure out how much of the source image fits per page
      const sourcePixelsPerPage = (usableHeight / scaledHeight) * img.height;
      const totalPages = Math.ceil(img.height / sourcePixelsPerPage);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage('letter', 'portrait');

        const srcY = page * sourcePixelsPerPage;
        const srcH = Math.min(sourcePixelsPerPage, img.height - srcY);
        const destH = (srcH / img.height) * scaledHeight;

        canvas.width = img.width;
        canvas.height = srcH;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, srcY, img.width, srcH, 0, 0, img.width, srcH);

        const pageDataUrl = canvas.toDataURL('image/png');
        pdf.addImage(pageDataUrl, 'PNG', MARGIN_IN, MARGIN_IN, scaledWidth, destH);

        // Draw a clean bottom border at the content edge of each page
        const contentBottom = MARGIN_IN + destH;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5 / DPI);
        pdf.line(MARGIN_IN, contentBottom, LETTER_WIDTH_IN - MARGIN_IN, contentBottom);
      }
    }

    const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(pdfFilename);
  } finally {
    element.classList.remove('export-mode');
  }
}
