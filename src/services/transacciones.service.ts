import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaccion } from '../entities/transaccion.entity';
import { CrearTransaccionDto } from '../dto/crear-transaccion.dto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Para generar UUID

@Injectable()
export class TransaccionesService {
  constructor(
    @InjectRepository(Transaccion)
    private transaccionRepo: Repository<Transaccion>,
  ) {}

  async crearTransaccion(dto: CrearTransaccionDto): Promise<any> {
    const transaccionId = uuidv4();
    try {
      // Simulación local sin llamada real a Wompi
      const wompiData = {
        id: 'fake_wompi_id_' + transaccionId,
        checkout_url: 'https://checkout-simulado.wompi.co',
      };

      const transaccion = this.transaccionRepo.create({
        id_transaccion: transaccionId,
        id_wompi: wompiData.id,
        id_usuario: dto.id_usuario,
        id_cliente: dto.id_cliente,
        id_cita: dto.id_cita,
        monto: dto.monto,
        servicio: dto.servicio,
        metodo_pago: dto.metodo_pago || 'Tarjeta',
        prestador_servicio: dto.prestador_servicio || 'Simulado',
        estado: 'pendiente',
      });

      await this.transaccionRepo.save(transaccion);
      return { redirect_url: wompiData.checkout_url };
    } catch (error) {
      console.error(error);
      throw new HttpException('Error al crear transacción', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async obtenerTransaccion(id: string): Promise<Transaccion | null> {
    return this.transaccionRepo.findOne({ where: { id_transaccion: id } });
  }

  async obtenerTransaccionesPorUsuario(id_usuario: string): Promise<Transaccion[]> {
    return this.transaccionRepo.find({ where: { id_usuario } });
  }

  async sincronizarTransaccion(id_transaccion: string): Promise<any> {
    const transaccion = await this.transaccionRepo.findOne({ where: { id_transaccion } });
    if (!transaccion) throw new HttpException('Transacción no encontrada', HttpStatus.NOT_FOUND);

    const response = await axios.get(`https://api.wompi.com/v1/transactions/${transaccion.id_wompi}`, {
      headers: { 'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}` },
    });

    // Actualizar estado basado en la respuesta
    transaccion.estado = response.data.status === 'APPROVED' ? 'aprobado' : 'rechazado';
    await this.transaccionRepo.save(transaccion);
    return transaccion;
  }
}