import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEvento } from '../entities/webhook-evento.entity';
import { Transaccion } from '../entities/transaccion.entity';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

@Injectable()
export class WebhookService {
  constructor(
    @InjectRepository(WebhookEvento)
    private webhookRepo: Repository<WebhookEvento>,
    @InjectRepository(Transaccion) // Inyectar para actualizar transacciones
    private transaccionRepo: Repository<Transaccion>,
  ) {}

  async manejarWebhook(payload: any, signature: string): Promise<void> {
    const secret = process.env.WOMPI_PRIVATE_KEY;
    const idEvento = uuidv4();

    if (!secret) throw new Error('La variable WOMPI_PRIVATE_KEY no está definida');

    const calculatedSignature = crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex');

    const firmaValida = calculatedSignature === signature;

    const evento = this.webhookRepo.create({
      id_evento: idEvento,
      id_wompi_evento: payload.id || '',
      payload,
      firma_valida: firmaValida,
      procesado: false,
    });

    await this.webhookRepo.save(evento);

    if (firmaValida) {
      const transaccion = await this.transaccionRepo.findOne({
        where: { id_wompi: payload.data.transaction.reference },
      });
      if (transaccion) {
        transaccion.estado =
          payload.data.transaction.status === 'APPROVED' ? 'aprobado' : 'rechazado';
        transaccion.id_evento_webhook = idEvento;
        await this.transaccionRepo.save(transaccion);
      }
    }
  }
}