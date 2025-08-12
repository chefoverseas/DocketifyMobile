import { PDFDocument } from "pdf-lib";

interface SignatureValidationResult {
  hasSignature: boolean;
  confidence: number; // 0-1 scale
  details: {
    hasDrawnSignature: boolean;
    hasTextSignature: boolean;
    hasFormFields: boolean;
    suspiciousKeywords: string[];
  };
}

export async function validatePDFSignature(pdfBuffer: Buffer): Promise<SignatureValidationResult> {
  try {
    // Use pdf-lib for basic analysis
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    let hasDrawnSignature = false;
    let hasTextSignature = false;
    let hasFormFields = false;
    const suspiciousKeywords: string[] = [];
    
    // Check for form fields (common in signed PDFs)
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    hasFormFields = fields.length > 0;
    
    // Simple text-based detection by examining the PDF structure
    const pdfBytes = pdfDoc.save();
    const pdfString = Buffer.from(await pdfBytes).toString('latin1');
    
    // Keywords that might indicate a signature
    const signatureKeywords = [
      'signature', 'signed', 'digital signature', 'electronically signed',
      'e-signature', 'esignature', '/sig', '/signature', 'DocuSign',
      'Adobe Sign', 'HelloSign', 'PandaDoc', 'signatory', 'autograph',
      '/Type /Sig', '/SubFilter', '/Contents', '/ByteRange'
    ];
    
    // Check for signature-related keywords in PDF structure
    const lowerPdfString = pdfString.toLowerCase();
    for (const keyword of signatureKeywords) {
      if (lowerPdfString.includes(keyword.toLowerCase())) {
        suspiciousKeywords.push(keyword);
        hasTextSignature = true;
      }
    }
    
    // Look for digital signature objects in PDF structure
    if (pdfString.includes('/Type /Sig') || pdfString.includes('/SubFilter')) {
      hasDrawnSignature = true;
      hasTextSignature = true;
    }
    
    // Check file size increase (signed PDFs are typically larger)
    const fileSizeKB = pdfBuffer.length / 1024;
    let sizeBonus = 0;
    if (fileSizeKB > 500) sizeBonus = 0.1; // Larger files might contain signatures
    
    // Calculate confidence score
    let confidence = 0;
    if (hasFormFields) confidence += 0.3;
    if (hasTextSignature) confidence += 0.4;
    if (hasDrawnSignature) confidence += 0.5;
    if (suspiciousKeywords.length > 0) confidence += 0.2;
    if (suspiciousKeywords.length > 2) confidence += 0.1;
    confidence += sizeBonus;
    
    // Cap at 1.0
    confidence = Math.min(confidence, 1.0);
    
    const hasSignature = confidence > 0.4; // Lower threshold for basic validation
    
    return {
      hasSignature,
      confidence,
      details: {
        hasDrawnSignature,
        hasTextSignature,
        hasFormFields,
        suspiciousKeywords: Array.from(new Set(suspiciousKeywords)) // Remove duplicates
      }
    };
    
  } catch (error) {
    console.error('PDF signature validation error:', error);
    throw new Error('Failed to validate PDF signature');
  }
}

export function isSignatureValid(result: SignatureValidationResult): boolean {
  // Consider a signature valid if:
  // - Confidence is above 40% (lowered threshold for basic validation)
  // - Has text signature indicators OR form fields OR drawn signature
  return result.confidence > 0.4 && 
         (result.details.hasTextSignature || result.details.hasFormFields || result.details.hasDrawnSignature);
}