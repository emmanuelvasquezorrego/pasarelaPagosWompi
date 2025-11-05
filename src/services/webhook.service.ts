import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEvento } from '../entities/webhook-evento.entity';
import { Transaccion } from '../entities/transaccion.entity';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

@Injectable()
export class WebhookService {
  // Inyectar los repositorios necesarios
  constructor(
    @InjectRepository(WebhookEvento) // Inyectar el repositorio de eventos de webhook
    private webhookRepo: Repository<WebhookEvento>,
    @InjectRepository(Transaccion) // Inyectar para actualizar transacciones
    private transaccionRepo: Repository<Transaccion>,
  ) {}

  // Manejar el webhook recibido
  async manejarWebhook(payload: any, signature: string): Promise<void> {
    const secret = process.env.WOMPI_PRIVATE_KEY;
    const idEvento = uuidv4();

    // Validar que la clave secreta esté definida
    if (!secret) throw new Error('La variable WOMPI_PRIVATE_KEY no está definida');

    // Calcular la firma del payload recibido
    const calculatedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    // Verificar si la firma es válida
    const firmaValida = calculatedSignature === signature;

    // Guardar el evento del webhook en la base de datos
    const evento = this.webhookRepo.create({
      id_evento: idEvento, // Generar un UUID para el evento
      id_wompi_evento: payload.id || '', // ID del evento de Wompi
      payload, // Payload completo del webhook
      firma_valida: firmaValida,
      procesado: false, // Se actualizará después de procesar
    });

    // Guardar en la base de datos
    await this.webhookRepo.save(evento);

    // Si la firma es válida, actualizar
    if (firmaValida) {
      const transaccion = await this.transaccionRepo.findOne({
        where: { id_wompi: payload.data.transaction.reference },
      });
      // Actualizar el estado de la transacción según el webhook
      if (transaccion) {
        transaccion.estado =
          payload.data.transaction.status === 'APPROVED' ? 'aprobado' : 'rechazado';
        transaccion.id_evento_webhook = idEvento;
        await this.transaccionRepo.save(transaccion);
      }
    }
  }
}