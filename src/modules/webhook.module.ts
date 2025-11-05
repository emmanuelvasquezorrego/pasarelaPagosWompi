import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {WebhookEvento} from '../entities/webhook-evento.entity';
import {WebhookService} from '../services/webhook.service';
import {WebhookController} from '../controllers/webhook.controller';
import { TransaccionesModule } from './transacciones.module';

// Módulo de webhook que importa la entidad WebhookEvento,
// el módulo de transacciones, provee el servicio de webhook y el controlador de webhook
@Module({
  imports: [TypeOrmModule.forFeature([WebhookEvento]), TransaccionesModule],
  providers: [WebhookService],
  controllers: [WebhookController],
})
export class WebhookModule {}