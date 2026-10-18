import { v4 as uuidv4 } from 'uuid';

export interface IntakeInput {
  fileName: string;
  fileBuffer?: Buffer;
  fileMimeType: string;
  fileSize: number;
  userConsentGiven: boolean;
  userId: string;
}

export interface IntakeOutput {
  reportId: string;
  userId: string;
  fileName: string;
  fileMimeType: string;
  fileSize: number;
  isScannedOrDigital: 'digital' | 'scanned' | 'mixed';
  intakeTimestamp: string;
  isValid: boolean;
  error?: string;
}

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png'
];

const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

export function runDocumentIntakeAgent(input: IntakeInput): IntakeOutput {
  const reportId = `rep_${uuidv4().substring(0, 12)}`;
  const intakeTimestamp = new Date().toISOString();

  // Validate Consent
  if (!input.userConsentGiven) {
    return {
      reportId,
      userId: input.userId,
      fileName: input.fileName,
      fileMimeType: input.fileMimeType,
      fileSize: input.fileSize,
      isScannedOrDigital: 'digital',
      intakeTimestamp,
      isValid: false,
      error: 'User consent was not provided. Processing sensitive medical data requires explicit user consent.'
    };
  }

  // Validate File Type
  const mime = input.fileMimeType.toLowerCase();
  const ext = input.fileName.split('.').pop()?.toLowerCase();
  const isAllowedExt = ext && ['pdf', 'jpg', 'jpeg', 'png'].includes(ext);

  if (!ALLOWED_MIME_TYPES.includes(mime) && !isAllowedExt) {
    return {
      reportId,
      userId: input.userId,
      fileName: input.fileName,
      fileMimeType: input.fileMimeType,
      fileSize: input.fileSize,
      isScannedOrDigital: 'digital',
      intakeTimestamp,
      isValid: false,
      error: `Unsupported file format: "${input.fileMimeType || ext}". Supported formats are PDF, JPG, and PNG.`
    };
  }

  // Validate File Size
  if (input.fileSize > MAX_FILE_SIZE_BYTES) {
    return {
      reportId,
      userId: input.userId,
      fileName: input.fileName,
      fileMimeType: input.fileMimeType,
      fileSize: input.fileSize,
      isScannedOrDigital: 'digital',
      intakeTimestamp,
      isValid: false,
      error: `File size exceeds the 15MB limit (File is ${(input.fileSize / (1024 * 1024)).toFixed(2)} MB).`
    };
  }

  if (input.fileSize <= 0) {
    return {
      reportId,
      userId: input.userId,
      fileName: input.fileName,
      fileMimeType: input.fileMimeType,
      fileSize: input.fileSize,
      isScannedOrDigital: 'digital',
      intakeTimestamp,
      isValid: false,
      error: 'Empty or corrupted file uploaded.'
    };
  }

  // Detect digital vs scanned: Images are scanned/photos; PDFs could be digital or scanned
  let isScannedOrDigital: 'digital' | 'scanned' | 'mixed' = 'digital';
  if (mime.startsWith('image/')) {
    isScannedOrDigital = 'scanned';
  } else if (mime === 'application/pdf') {
    // If PDF contains low metadata or specific header traits, can be mixed
    isScannedOrDigital = 'digital';
  }

  return {
    reportId,
    userId: input.userId,
    fileName: input.fileName,
    fileMimeType: input.fileMimeType,
    fileSize: input.fileSize,
    isScannedOrDigital,
    intakeTimestamp,
    isValid: true
  };
}
