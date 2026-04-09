import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const LETTER_WIDTH_IN = 8.5;
const LETTER_HEIGHT_IN = 11;
const DPI = 96;
const MARGIN_IN = 0.25;

/** Collect the bottom-edge Y positions of every direct child of the schedule container, in image pixels. */
function getRowBoundaries(element: HTMLElement, pixelRatio: number): number[] {
  const children = element.children;
  const boundaries: number[] = [];
  for (let i = 0; i < children.length; i++) {
    const child = children[i] as HTMLElement;
    boundaries.push((child.offsetTop + child.offsetHeight) * pixelRatio);
  }
  return boundaries;
}

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
      // Multi-page: slice at row boundaries so rows are never cut in half
      const pixelRatio = 2;
      const rowBoundaries = getRowBoundaries(element, pixelRatio);

      // How many source pixels fit per page
      const sourcePixelsPerPage = (usableHeight / scaledHeight) * img.height;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;

      let currentY = 0;
      let pageIndex = 0;

      while (currentY < img.height) {
        if (pageIndex > 0) pdf.addPage('letter', 'portrait');

        const maxY = currentY + sourcePixelsPerPage;

        // Find the last row boundary that fits within this page
        let bestBreak = currentY;
        for (const boundary of rowBoundaries) {
          if (boundary > currentY && boundary <= maxY) {
            bestBreak = boundary;
          }
        }
        // Fallback: if no boundary fits (single row taller than page), slice at max
        if (bestBreak <= currentY) bestBreak = Math.min(maxY, img.height);

        const srcH = bestBreak - currentY;
        const destH = (srcH / img.height) * scaledHeight;

        canvas.width = img.width;
        canvas.height = srcH;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, currentY, img.width, srcH, 0, 0, img.width, srcH);

        const pageDataUrl = canvas.toDataURL('image/png');
        pdf.addImage(pageDataUrl, 'PNG', MARGIN_IN, MARGIN_IN, scaledWidth, destH);

        // Draw a clean bottom border at the content edge of each page
        const contentBottom = MARGIN_IN + destH;
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5 / DPI);
        pdf.line(MARGIN_IN, contentBottom, LETTER_WIDTH_IN - MARGIN_IN, contentBottom);

        currentY = bestBreak;
        pageIndex++;
      }
    }

    const pdfFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    pdf.save(pdfFilename);
  } finally {
    element.classList.remove('export-mode');
  }
}
