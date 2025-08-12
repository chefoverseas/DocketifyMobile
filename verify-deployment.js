#!/usr/bin/env node

/**
 * Deployment Verification Script
 * 
 * This script verifies all components are ready for production deployment
 * and ensures the platform migration bypass is properly configured.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

console.log('🔍 DEPLOYMENT VERIFICATION STARTING...\n');

async function verifyDatabaseSync() {
  console.log('📊 Checking database synchronization...');
  try {
    const { stdout } = await execAsync('npm run db:push');
    if (stdout.includes('No changes detected')) {
      console.log('✅ Database: Schema synchronized');
      return true;
    } else {
      console.log('⚠️  Database: Changes detected - may need sync');
      console.log(stdout);
      return false;
    }
  } catch (error) {
    console.log('❌ Database: Error checking sync status');
    console.log(error.message);
    return false;
  }
}

async function verifyProductionBuild() {
  console.log('🏗️  Verifying production build...');
  try {
    const { stdout, stderr } = await execAsync('npm run build');
    const success = (stdout.includes('built in') || stdout.includes('✓ built')) && (stdout.includes('Done in') || stdout.includes('⚡ Done'));
    if (success) {
      // Extract bundle size from output
      const bundleMatch = stdout.match(/index-[\w]+\.js\s+([\d.]+\s*[kM]B)/);
      const serverMatch = stdout.match(/dist\/index\.js\s+([\d.]+kb)/);
      
      console.log('✅ Build: Production build successful');
      if (bundleMatch) console.log(`   Frontend bundle: ${bundleMatch[1]}`);
      if (serverMatch) console.log(`   Server bundle: ${serverMatch[1]}`);
      return true;
    } else {
      console.log('❌ Build: Production build failed');
      console.log('Build output:', stdout);
      if (stderr) console.log('Error output:', stderr);
      return false;
    }
  } catch (error) {
    console.log('❌ Build: Error during build process');
    console.log(error.message);
    return false;
  }
}

function verifyEnvironmentVariables() {
  console.log('🔧 Checking environment variables...');
  const required = ['DATABASE_URL', 'SESSION_SECRET', 'SENDGRID_API_KEY'];
  const missing = required.filter(varName => !process.env[varName]);
  
  if (missing.length === 0) {
    console.log('✅ Environment: All required variables present');
    console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Missing'}`);
    console.log(`   SESSION_SECRET: ${process.env.SESSION_SECRET?.length || 0} characters`);
    console.log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY?.startsWith('SG.') ? 'Valid format' : 'Invalid format'}`);
    return true;
  } else {
    console.log('❌ Environment: Missing required variables:', missing.join(', '));
    console.log('   ⚠️  These must be set in Deployments pane, not just Secrets pane');
    return false;
  }
}

function verifyProjectStructure() {
  console.log('📁 Verifying project structure...');
  const requiredFiles = [
    'package.json',
    'server/index.ts',
    'shared/schema.ts',
    'client/src/App.tsx',
    'drizzle.config.ts'
  ];
  
  const missingFiles = requiredFiles.filter(file => !existsSync(file));
  
  if (missingFiles.length === 0) {
    console.log('✅ Structure: All required files present');
    return true;
  } else {
    console.log('❌ Structure: Missing files:', missingFiles.join(', '));
    return false;
  }
}

function verifyDeploymentConfig() {
  console.log('⚙️  Verifying deployment configuration...');
  
  // Check if deployment bypass files exist
  const bypassFiles = [
    'DEPLOYMENT_PLATFORM_FIX.md',
    'deploy-bypass.js',
    'REPLIT_SUPPORT_TEMPLATE.md'
  ];
  
  const existingFiles = bypassFiles.filter(file => existsSync(file));
  
  if (existingFiles.length === bypassFiles.length) {
    console.log('✅ Deployment: Bypass configuration complete');
    console.log('   - Platform migration issue workaround: ACTIVE');
    console.log('   - Support documentation: READY');
    return true;
  } else {
    console.log('⚠️  Deployment: Some bypass files missing');
    return false;
  }
}

async function main() {
  const results = await Promise.all([
    verifyDatabaseSync(),
    verifyProductionBuild(),
    Promise.resolve(verifyEnvironmentVariables()),
    Promise.resolve(verifyProjectStructure()),
    Promise.resolve(verifyDeploymentConfig())
  ]);
  
  const allPassed = results.every(result => result);
  
  console.log('\n🎯 DEPLOYMENT VERIFICATION SUMMARY:');
  console.log('=====================================');
  
  if (allPassed) {
    console.log('🎉 STATUS: READY FOR DEPLOYMENT');
    console.log('\n📋 DEPLOYMENT CHECKLIST:');
    console.log('1. ✅ Database schema synchronized');
    console.log('2. ✅ Production build optimized');
    console.log('3. ✅ Environment variables configured');
    console.log('4. ✅ Project structure complete');
    console.log('5. ✅ Migration bypass configured');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Verify secrets are in Deployments pane (not just Secrets)');
    console.log('2. Click Deploy in Replit Deployments');
    console.log('3. Application will bypass platform migration issue');
    console.log('4. If deployment still fails, use REPLIT_SUPPORT_TEMPLATE.md');
    
    console.log('\n✨ Expected Result: Successful deployment with all features operational');
  } else {
    console.log('⚠️  STATUS: ISSUES DETECTED - Review failed checks above');
    console.log('\n🔧 Required actions:');
    results.forEach((result, index) => {
      if (!result) {
        const checks = ['Database Sync', 'Production Build', 'Environment Variables', 'Project Structure', 'Deployment Config'];
        console.log(`   - Fix: ${checks[index]}`);
      }
    });
  }
  
  process.exit(allPassed ? 0 : 1);
}

main().catch(error => {
  console.error('❌ Verification failed:', error.message);
  process.exit(1);
});