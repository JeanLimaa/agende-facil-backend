import { Injectable } from '@nestjs/common';
import * as cron from 'node-cron';
import { AppointmentService } from './appointment.service';

@Injectable()
export class AppointmentScheduler {
  constructor(private readonly appointmentService: AppointmentService) {}

  // Agendando uma tarefa para enviar lembretes de agendamento
  async scheduleAppointmentReminders() {
    cron.schedule('0 9 * * *', async () => {
      const appointments = await this.appointmentService.listPendingAppointments();
      
      // Iterando sobre os agendamentos para verificar se faltam 24 horas
      appointments.forEach((appointment) => {
        const appointmentDate = new Date(appointment.date);
        const currentTime = Date.now();
        const timeDifference = appointmentDate.getTime() - currentTime;

        // Enviar lembretes se o agendamento for dentro de 24h
        if (timeDifference <= 24 * 60 * 60 * 1000 && timeDifference > 0) {
          // implementar a lógica de envio de lembrete aqui
          console.log(`Enviar lembrete para o agendamento ${appointment.id}, que ocorrerá em 24h`);
        }
      });
    });
  }
}
