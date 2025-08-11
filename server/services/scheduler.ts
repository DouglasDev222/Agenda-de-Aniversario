import * as cron from 'node-cron';
import { storage } from '../storage';
import { whatsappService } from './whatsapp';

export class SchedulerService {
  private reminderJob: cron.ScheduledTask | null = null;
  private birthdayJob: cron.ScheduledTask | null = null;

  async initialize(): Promise<void> {
    await this.setupSchedules();
  }

  private async setupSchedules(): Promise<void> {
    const settings = await storage.getSettings();
    if (!settings) return;

    // Stop existing jobs
    this.stop();

    // Schedule reminder messages (1 day before)
    const reminderCron = this.timeToCron(settings.reminderTime);
    this.reminderJob = cron.schedule(reminderCron, async () => {
      await this.checkReminderBirthdays();
    });

    // Schedule birthday messages
    const birthdayCron = this.timeToCron(settings.birthdayTime);
    this.birthdayJob = cron.schedule(birthdayCron, async () => {
      await this.checkTodayBirthdays();
    });

    console.log('Birthday scheduler initialized');
  }

  private timeToCron(time: string): string {
    const [hours, minutes] = time.split(':');
    return `${minutes} ${hours} * * *`;
  }

  private async checkReminderBirthdays(): Promise<void> {
    const settings = await storage.getSettings();
    if (!settings) return;

    const employees = await storage.getEmployees();
    const contacts = await storage.getContacts();
    const activeContacts = contacts.filter(c => c.isActive);

    if (activeContacts.length === 0) return;

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    for (const employee of employees) {
      const birthDate = new Date(employee.birthDate);
      
      // Check if tomorrow is the employee's birthday (ignoring year)
      if (birthDate.getMonth() === tomorrow.getMonth() && 
          birthDate.getDate() === tomorrow.getDate()) {
        
        // Skip weekends if disabled
        if (!settings.weekendsEnabled && this.isWeekend(tomorrow)) {
          continue;
        }

        const message = this.formatMessage(settings.reminderTemplate, employee);
        
        for (const contact of activeContacts) {
          await this.sendMessageWithRetry(employee, contact, message, 'reminder', settings);
        }
      }
    }
  }

  private async checkTodayBirthdays(): Promise<void> {
    const settings = await storage.getSettings();
    if (!settings) return;

    const employees = await storage.getEmployees();
    const contacts = await storage.getContacts();
    const activeContacts = contacts.filter(c => c.isActive);

    if (activeContacts.length === 0) return;

    const today = new Date();

    for (const employee of employees) {
      const birthDate = new Date(employee.birthDate);
      
      // Check if today is the employee's birthday (ignoring year)
      if (birthDate.getMonth() === today.getMonth() && 
          birthDate.getDate() === today.getDate()) {
        
        // Skip weekends if disabled
        if (!settings.weekendsEnabled && this.isWeekend(today)) {
          continue;
        }

        const message = this.formatMessage(settings.birthdayTemplate, employee);
        
        for (const contact of activeContacts) {
          await this.sendMessageWithRetry(employee, contact, message, 'birthday', settings);
        }
      }
    }
  }

  private async sendMessageWithRetry(
    employee: any,
    contact: any,
    message: string,
    type: 'reminder' | 'birthday',
    settings: any
  ): Promise<void> {
    let attempts = 0;
    let success = false;
    let errorMessage = '';

    while (attempts < settings.retryAttempts && !success) {
      attempts++;
      
      try {
        success = await whatsappService.sendMessage(contact.phone, message);
        
        if (success) {
          // Log successful message
          await storage.createMessage({
            employeeId: employee.id,
            contactId: contact.id,
            type,
            content: message,
            status: 'sent',
            scheduledFor: null,
            sentAt: new Date(),
            errorMessage: null,
          });
        } else {
          errorMessage = `Failed to send message (attempt ${attempts})`;
        }
      } catch (error) {
        errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
      }

      if (!success && attempts < settings.retryAttempts) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, settings.retryInterval * 60 * 1000));
      }
    }

    if (!success) {
      // Log failed message
      await storage.createMessage({
        employeeId: employee.id,
        contactId: contact.id,
        type,
        content: message,
        status: 'failed',
        scheduledFor: null,
        sentAt: null,
        errorMessage,
      });
    }
  }

  private formatMessage(template: string, employee: any): string {
    const birthDate = new Date(employee.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    
    return template
      .replace(/\[NOME\]/g, employee.name)
      .replace(/\[CARGO\]/g, employee.position)
      .replace(/\[IDADE\]/g, age.toString())
      .replace(/\[DATA_NASCIMENTO\]/g, birthDate.toLocaleDateString('pt-BR'));
  }

  private isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
  }

  async updateSchedules(): Promise<void> {
    await this.setupSchedules();
  }

  stop(): void {
    if (this.reminderJob) {
      this.reminderJob.stop();
      this.reminderJob = null;
    }
    if (this.birthdayJob) {
      this.birthdayJob.stop();
      this.birthdayJob = null;
    }
  }
}

export const schedulerService = new SchedulerService();
