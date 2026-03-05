import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import * as path from 'path';

@Injectable()
export class ConvertService {
  async convert(filePath: string, forceOcr = false): Promise<any> {
    return new Promise((resolve, reject) => {
      const ext = path.extname(filePath).toLowerCase();

      let script = '';
      let outputPath = '';

      // ===== DOCX -> PDF =====
      if (ext === '.docx' || ext === '.doc') {
        script = 'scripts/docx_to_pdf.py';
        outputPath = filePath.replace(ext, '.pdf');
      }

      // ===== PDF -> DOCX =====
      else if (ext === '.pdf') {
        script = 'scripts/pdf_to_docx.py';
        outputPath = filePath.replace(ext, '.docx');
      }

      else {
        return reject(new Error('Unsupported file type'));
      }

      const args = [
        script,
        filePath,
        outputPath,
        forceOcr ? 'true' : 'false',
      ];

      const pythonProcess = spawn(
        'C:\\Dev\\Convert File Genres\\venv310\\Scripts\\python.exe',
        args
      );
      
      let stdout = '';
      let stderr = '';

      pythonProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonProcess.on('close', (code) => {
  const cleanOutput = stdout.trim();

  console.log('PYTHON STDOUT:', cleanOutput);
  if (stderr) {
    console.error('PYTHON STDERR:', stderr);
  }

  // ===== Detect PDF scan =====
  if (cleanOutput.includes('SCAN_PDF_DETECTED')) {
    return resolve({ type: 'scan' });
  }

  // ===== Convert thành công =====
  if (
    cleanOutput.includes('TEXT_CONVERT_SUCCESS') ||
    cleanOutput.includes('OCR_CONVERT_SUCCESS') ||
    cleanOutput.includes('DOCX_TO_PDF_SUCCESS')
  ) {
    return resolve({
      type: 'success',
      outputPath,
    });
  }

  return reject(new Error('Convert failed'));
});
    });
  }
}