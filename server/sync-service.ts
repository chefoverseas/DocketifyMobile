import { storage } from './storage';

interface SyncReport {
  timestamp: string;
  usersChecked: number;
  inconsistencies: Array<{
    userId: string;
    userEmail: string;
    type: 'docket' | 'workpermit' | 'workvisa' | 'contract';
    issue: string;
    fixed: boolean;
  }>;
  totalInconsistencies: number;
}

class DataSyncService {
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) {
      console.log('🔄 Data sync service is already running');
      return;
    }

    console.log('🚀 Starting data synchronization service - checking every 5 minutes');
    this.isRunning = true;
    
    // Run initial sync immediately
    this.runSync();
    
    // Schedule subsequent syncs every 5 minutes
    this.syncInterval = setInterval(() => {
      this.runSync();
    }, 5 * 60 * 1000); // 5 minutes
  }

  stop() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('⏹️ Data synchronization service stopped');
  }

  private async runSync(): Promise<SyncReport> {
    const startTime = new Date();
    console.log(`🔍 [${startTime.toISOString()}] Starting data consistency check...`);

    const report: SyncReport = {
      timestamp: startTime.toISOString(),
      usersChecked: 0,
      inconsistencies: [],
      totalInconsistencies: 0
    };

    try {
      // Get all users
      const users = await storage.getAllUsers();
      report.usersChecked = users.length;

      for (const user of users) {
        await this.checkUserDataConsistency(user, report);
      }

      // Log summary
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      if (report.totalInconsistencies === 0) {
        console.log(`✅ [${endTime.toISOString()}] Data sync complete - All ${report.usersChecked} users consistent (${duration}ms)`);
      } else {
        console.log(`⚠️ [${endTime.toISOString()}] Data sync complete - Found ${report.totalInconsistencies} inconsistencies across ${report.usersChecked} users (${duration}ms)`);
        report.inconsistencies.forEach(issue => {
          console.log(`   🔧 ${issue.userEmail} (${issue.type}): ${issue.issue} - ${issue.fixed ? 'FIXED' : 'NEEDS ATTENTION'}`);
        });
      }

    } catch (error) {
      console.error('❌ Data sync service error:', error);
    }

    return report;
  }

  private async checkUserDataConsistency(user: any, report: SyncReport) {
    try {
      // Check Docket consistency
      await this.checkDocketConsistency(user, report);
      
      // Check Work Permit consistency
      await this.checkWorkPermitConsistency(user, report);
      
      // Check Work Visa consistency
      await this.checkWorkVisaConsistency(user, report);
      
      // Check Contract consistency
      await this.checkContractConsistency(user, report);
      
    } catch (error) {
      console.error(`❌ Error checking consistency for user ${user.email}:`, error);
    }
  }

  private async checkDocketConsistency(user: any, report: SyncReport) {
    try {
      const docket = await storage.getDocketByUserId(user.id);
      
      if (!docket) {
        // Auto-create missing docket
        await storage.createDocket({
          userId: user.id,
          passportFrontUrl: null,
          passportLastUrl: null,
          passportVisaUrls: null,
          passportPhotoUrl: null,
          resumeUrl: null,
          educationCertificatesUrls: null,
          experienceCertificatesUrls: null,
          personalPhotosUrls: null,
          proofOfAddressUrl: null,
          birthCertificateUrl: null,
          additionalDocumentsUrls: null,
          references: null
        });
        
        this.addInconsistency(report, user, 'docket', 'Missing docket record - created automatically', true);
        return;
      }

      // Check for any missing or invalid data
      if (!docket.passportFrontUrl && !docket.passportLastUrl) {
        this.addInconsistency(report, user, 'docket', 'No passport documents uploaded yet', false);
      }

    } catch (error) {
      this.addInconsistency(report, user, 'docket', `Error checking docket: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
    }
  }

  private async checkWorkPermitConsistency(user: any, report: SyncReport) {
    try {
      const workPermit = await storage.getWorkPermitByUserId(user.id);
      
      if (!workPermit) {
        // Auto-create missing work permit
        await storage.createWorkPermit({
          userId: user.id,
          status: 'preparation',
          notes: null,
          finalDocketUrl: null,
          trackingCode: null
        });
        
        this.addInconsistency(report, user, 'workpermit', 'Missing work permit record - created automatically', true);
        return;
      }

      // Check for invalid status values
      const validStatuses = ['preparation', 'under_review', 'approved', 'rejected', 'submitted'];
      if (!validStatuses.includes(workPermit.status)) {
        await storage.updateWorkPermit(user.id, { status: 'preparation' });
        this.addInconsistency(report, user, 'workpermit', `Invalid status "${workPermit.status}" - reset to preparation`, true);
      }

    } catch (error) {
      this.addInconsistency(report, user, 'workpermit', `Error checking work permit: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
    }
  }

  private async checkWorkVisaConsistency(user: any, report: SyncReport) {
    try {
      const workVisa = await storage.getWorkVisaByUserId(user.id);
      
      if (!workVisa) {
        // Auto-create missing work visa
        await storage.createWorkVisa({
          userId: user.id,
          status: 'preparation',
          visaType: null,
          embassyLocation: null,
          applicationDate: null,
          interviewDate: null,
          interviewTime: null,
          notes: null,
          trackingCode: null,
          irlApplicationFormUrl: null,
          visaAppointmentUrl: null,
          travelMedicalInsuranceUrl: null,
          policeVerificationUrl: null,
          passportBioDataUrl: null,
          educationDocumentsUrl: null,
          experienceLettersUrl: null,
          bankStatementUrl: null,
          irishAccommodationDocumentUrl: null,
          healthInsuranceDocumentUrl: null,
          fullDocketVisaSubmissionUrl: null,
          finalVisaUrl: null
        });
        
        this.addInconsistency(report, user, 'workvisa', 'Missing work visa record - created automatically', true);
        return;
      }

      // Check for invalid status values
      const validStatuses = ['preparation', 'applied', 'awaiting_decision', 'interview_scheduled', 'approved', 'rejected'];
      if (!validStatuses.includes(workVisa.status)) {
        await storage.updateWorkVisa(user.id, { status: 'preparation' });
        this.addInconsistency(report, user, 'workvisa', `Invalid status "${workVisa.status}" - reset to preparation`, true);
      }

      // Check interview date/time consistency
      if (workVisa.interviewDate && !workVisa.interviewTime) {
        this.addInconsistency(report, user, 'workvisa', 'Interview date set but time missing - admin should set time', false);
      }

      // Check status consistency with interview scheduling
      if (workVisa.status === 'interview_scheduled' && (!workVisa.interviewDate || !workVisa.interviewTime)) {
        await storage.updateWorkVisa(user.id, { status: 'applied' });
        this.addInconsistency(report, user, 'workvisa', 'Status "interview_scheduled" but missing date/time - reset to applied', true);
      }

    } catch (error) {
      this.addInconsistency(report, user, 'workvisa', `Error checking work visa: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
    }
  }

  private async checkContractConsistency(user: any, report: SyncReport) {
    try {
      const contract = await storage.getContractByUserId(user.id);
      
      if (!contract) {
        // Auto-create missing contract
        await storage.createContract({
          userId: user.id,
          companyContractOriginalUrl: null,
          companyContractSignedUrl: null,
          companyContractStatus: 'pending',
          jobOfferOriginalUrl: null,
          jobOfferSignedUrl: null,
          jobOfferStatus: 'pending',
          contractUrl: null,
          jobOfferUrl: null,
          notes: null
        });
        
        this.addInconsistency(report, user, 'contract', 'Missing contract record - created automatically', true);
        return;
      }

      // Check for invalid status values
      const validStatuses = ['pending', 'sent', 'signed', 'completed', 'cancelled'];
      if (contract.companyContractStatus && !validStatuses.includes(contract.companyContractStatus)) {
        await storage.updateContract(user.id, { companyContractStatus: 'pending' });
        this.addInconsistency(report, user, 'contract', `Invalid contract status "${contract.companyContractStatus}" - reset to pending`, true);
      }

    } catch (error) {
      this.addInconsistency(report, user, 'contract', `Error checking contract: ${error instanceof Error ? error.message : 'Unknown error'}`, false);
    }
  }

  private addInconsistency(report: SyncReport, user: any, type: 'docket' | 'workpermit' | 'workvisa' | 'contract', issue: string, fixed: boolean) {
    report.inconsistencies.push({
      userId: user.id,
      userEmail: user.email,
      type,
      issue,
      fixed
    });
    report.totalInconsistencies++;
  }

  // Manual sync trigger for admin
  async manualSync(): Promise<SyncReport> {
    console.log('🔧 Manual data sync triggered by admin');
    return await this.runSync();
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      nextSyncIn: this.syncInterval ? '5 minutes' : 'Not scheduled'
    };
  }
}

export const syncService = new DataSyncService();