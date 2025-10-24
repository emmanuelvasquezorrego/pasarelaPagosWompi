import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { WebhookService } from '../services/webhook.service';

@Controller('webhook')
export class WebhookController {
  constructor(private service: WebhookService) {}

  @Post('wompi')
  async manejarWebhook(@Body() payload: any, @Req() req: any, @Res() res: any) {
    const signature = req.headers['x-event-signature']; // Header de Wompi
    await this.service.manejarWebhook(payload, signature);
    res.status(200).send('Webhook recibido');
  }
}