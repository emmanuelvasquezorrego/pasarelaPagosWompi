import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaccion } from '../entities/transaccion.entity';
import { TransaccionesService } from '../services/transacciones.service';
import { TransaccionesController } from '../controllers/transacciones.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaccion])],
  providers: [TransaccionesService],
  controllers: [TransaccionesController],
  exports: [TypeOrmModule, TransaccionesService],
})
export class TransaccionesModule {}