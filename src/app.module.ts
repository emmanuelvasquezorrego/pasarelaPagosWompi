import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { TransaccionesModule } from './modules/transacciones.module';
import { WebhookModule } from './modules/webhook.module';
import { Transaccion } from './entities/transaccion.entity';
import { WebhookEvento } from './entities/webhook-evento.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Cargar variables de entorno globalmente
    TypeOrmModule.forRoot({ // Configuración de TypeORM
      type: 'mysql', // Tipo de base de datos
      host: process.env.DB_HOST, // Host de la base de datos
      port: 3306,
      username: process.env.DB_USER, // Usuario de la base de datos
      password: process.env.DB_PASS, // Contraseña de la base de datos
      database: process.env.DB_NAME, // Nombre de la base de datos
      entities: [Transaccion, WebhookEvento], // Entidades a usar
      synchronize: true, // Sincronizar la base de datos
    }),
    TransaccionesModule,
    WebhookModule,
  ],
})
export class AppModule {}