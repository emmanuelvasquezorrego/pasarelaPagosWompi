import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';

@Controller('webhook')
export class WebhookController {
  // Inyectar el servicio de webhook
  constructor(private service: WebhookService) {}

  // Manejar el webhook de Wompi
  @Post('wompi')
  async manejarWebhook(@Body() payload: any, @Req() req: any, @Res() res: any) {
    const signature = req.headers['x-event-signature']; // Header de Wompi
    await this.service.manejarWebhook(payload, signature); // Procesar el webhook
    res.status(200).send('Webhook recibido');
  }
}