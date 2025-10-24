import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransaccionesModule } from './modules/transacciones.module';
import { WebhookModule } from './modules/webhook.module';
import { Transaccion } from './entities/transaccion.entity';
import { WebhookEvento } from './entities/webhook-evento.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Transaccion, WebhookEvento],
      synchronize: true, // Usa false en producción
    }),
    TransaccionesModule,
    WebhookModule,
  ],
})
export class AppModule {}