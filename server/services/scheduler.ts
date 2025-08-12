import * as cron from 'node-cron';
import { storage } from '../storage';
import { whatsappService } from './whatsapp';
import { Employee, Contact, Settings } from '../types'; // Assuming these types are defined elsewhere

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

    // Usar fuso horário de São Paulo para cálculos de data
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const tomorrow = new Date(brazilTime);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log(`🕐 Verificando lembretes para amanhã: ${tomorrow.toLocaleDateString('pt-BR')}`);

    for (const employee of employees) {
      // Parse da data de nascimento no fuso horário local
      const birthDate = new Date(employee.birthDate + 'T00:00:00');

      console.log(`🔍 Verificando ${employee.name}: nascimento ${birthDate.getDate()}/${birthDate.getMonth() + 1}, amanhã será ${tomorrow.getDate()}/${tomorrow.getMonth() + 1}`);

      // Check if tomorrow is the employee's birthday (ignoring year)
      if (birthDate.getMonth() === tomorrow.getMonth() &&
          birthDate.getDate() === tomorrow.getDate()) {

        console.log(`🎂 LEMBRETE: ${employee.name} faz aniversário amanhã!`);

        // Skip weekends if disabled
        if (!settings.weekendsEnabled && this.isWeekend(tomorrow)) {
          console.log(`⏭️ Pulando fim de semana para ${employee.name}`);
          continue;
        }

        await this.sendReminderMessage(employee);
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

    // Usar fuso horário de São Paulo para cálculos de data
    const now = new Date();
    const brazilTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Sao_Paulo"}));
    const today = new Date(brazilTime);

    console.log(`🕐 Verificando aniversários de hoje: ${today.toLocaleDateString('pt-BR')}`);

    for (const employee of employees) {
      // Parse da data de nascimento no fuso horário local
      const birthDate = new Date(employee.birthDate + 'T00:00:00');

      console.log(`🔍 Verificando ${employee.name}: nascimento ${birthDate.getDate()}/${birthDate.getMonth() + 1}, hoje é ${today.getDate()}/${today.getMonth() + 1}`);

      // Check if today is the employee's birthday (ignoring year)
      if (birthDate.getMonth() === today.getMonth() &&
          birthDate.getDate() === today.getDate()) {

        console.log(`🎉 ANIVERSÁRIO: ${employee.name} faz aniversário hoje!`);

        // Skip weekends if disabled
        if (!settings.weekendsEnabled && this.isWeekend(today)) {
          console.log(`⏭️ Pulando fim de semana para ${employee.name}`);
          continue;
        }

        await this.sendBirthdayMessage(employee);
      }
    }
  }

  private async sendReminderMessage(employee: Employee): Promise<void> {
    const settings = await storage.getSettings();
    if (!settings) return;

    const contacts = await storage.getContacts();
    const activeContacts = contacts.filter(c => c.isActive);

    if (activeContacts.length === 0) {
      console.log('⚠️ Nenhum contato de gerência ativo encontrado');
      return;
    }

    console.log(`⏰ Enviando lembrete para ${employee.name} aos contatos:`,
                activeContacts.map(c => `${c.name} (${c.phone})`));

    const message = this.formatMessage(settings.reminderTemplate, employee);

    for (const contact of activeContacts) {
      console.log(`📤 Preparando envio para: ${contact.name} - ${contact.phone}`);
      await this.sendMessageWithRetry(employee, contact, message, 'reminder', settings);
    }
  }

  private async sendBirthdayMessage(employee: Employee): Promise<void> {
    const settings = await storage.getSettings();
    if (!settings) return;

    const contacts = await storage.getContacts();
    const activeContacts = contacts.filter(c => c.isActive);

    if (activeContacts.length === 0) {
      console.log('⚠️ Nenhum contato de gerência ativo encontrado');
      return;
    }

    console.log(`🎂 Enviando mensagem de aniversário para ${employee.name} aos contatos:`,
                activeContacts.map(c => `${c.name} (${c.phone})`));

    const message = this.formatMessage(settings.birthdayTemplate, employee);

    for (const contact of activeContacts) {
      console.log(`📤 Preparando envio para: ${contact.name} - ${contact.phone}`);
      await this.sendMessageWithRetry(employee, contact, message, 'birthday', settings);
    }
  }

  private async sendMessageWithRetry(
    employee: Employee,
    contact: Contact,
    message: string,
    type: 'birthday' | 'reminder',
    settings: Settings
  ): Promise<void> {
    let success = false;
    let attempts = 0;
    let errorMessage = '';

    console.log(`🔄 Iniciando envio para: ${contact.name} (${contact.phone}) - Funcionário: ${employee.name}`);

    while (attempts < settings.retryAttempts && !success) {
      attempts++;

      try {
        console.log(`📞 Tentativa ${attempts}: Enviando para ${contact.phone}`);
        success = await whatsappService.sendMessage(contact.phone, message);

        if (success) {
          console.log(`✅ Mensagem enviada com sucesso para ${contact.name} (${contact.phone})`);
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
          console.log(`❌ Falha no envio para ${contact.name} (${contact.phone}): ${errorMessage}`);
        }
      } catch (error) {
        errorMessage = `Error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.log(`❌ Erro no envio para ${contact.name} (${contact.phone}): ${errorMessage}`);
      }

      if (!success && attempts < settings.retryAttempts) {
        console.log(`⏳ Aguardando ${settings.retryInterval} minutos antes da próxima tentativa...`);
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, settings.retryInterval * 60 * 1000));
      }
    }

    if (!success) {
      console.log(`💥 Falha definitiva no envio para ${contact.name} (${contact.phone})`);
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

  private formatMessage(template: string, employee: Employee): string {
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