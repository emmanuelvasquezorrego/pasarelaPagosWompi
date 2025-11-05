import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true }); // Habilitar CORS 

  // Configuración de Swagger
  const config = new DocumentBuilder()
    .setTitle('Pasarela de Pagos con Wompi')
    .setDescription('API desarrollada en NestJS que gestiona transacciones, webhook y comunicación con Wompi')
    .setVersion('1.0')
    .addTag('pagos')
    .build();

  // Crear el documento Swagger  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3000); // Escuchar en el puerto 3000
  console.log('Servidor corriendo en http://localhost:3000');
  console.log('Documentación Swagger: http://localhost:3000/api/docs');
  console.log('Adminer: http://localhost:8090');
}
bootstrap();