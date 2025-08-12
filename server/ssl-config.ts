import fs from 'fs';
import path from 'path';

export interface SSLConfig {
  key: Buffer;
  cert: Buffer;
}

export function loadSSLConfig(): SSLConfig | null {
  try {
    const keyPath = path.join(process.cwd(), 'certs', 'key.pem');
    const certPath = path.join(process.cwd(), 'certs', 'cert.pem');
    
    if (!fs.existsSync(keyPath) || !fs.existsSync(certPath)) {
      return null;
    }
    
    const key = fs.readFileSync(keyPath);
    const cert = fs.readFileSync(certPath);
    
    return { key, cert };
  } catch (error) {
    console.error('Failed to load SSL configuration:', error);
    return null;
  }
}

export function generateSSLCertificates(): boolean {
  try {
    const { execSync } = require('child_process');
    const certsDir = path.join(process.cwd(), 'certs');
    
    // Create certs directory if it doesn't exist
    if (!fs.existsSync(certsDir)) {
      fs.mkdirSync(certsDir, { recursive: true });
    }
    
    // Generate self-signed certificate for development
    const command = `openssl req -x509 -newkey rsa:4096 -keyout ${certsDir}/key.pem -out ${certsDir}/cert.pem -days 365 -nodes -subj "/C=US/ST=CA/L=San Francisco/O=Docketify/OU=IT Department/CN=localhost"`;
    
    execSync(command, { stdio: 'inherit' });
    
    console.log('✅ SSL certificates generated successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to generate SSL certificates:', error);
    return false;
  }
}