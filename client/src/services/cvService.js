export async function correctCVText(cv) {
  console.info('Placeholder correctCVText', cv);
  return cv;
}

export async function translateCV(cv, language) {
  console.info('Placeholder translateCV', language, cv);
  return cv;
}

export async function improveUploadedCV(file) {
  console.info('Placeholder improveUploadedCV', file?.name);
  return { status: 'pending', fileName: file?.name };
}

export function exportToPDF() {
  // Integrar aqui html2pdf, jsPDF o un endpoint backend cuando este disponible.
  window.print();
}
