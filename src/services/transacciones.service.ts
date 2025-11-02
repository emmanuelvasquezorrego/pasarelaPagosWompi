import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaccion } from '../entities/transaccion.entity';
import { CrearTransaccionDto } from '../dto/crear-transaccion.dto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Para generar UUID
import crypto from 'crypto';

@Injectable()
export class TransaccionesService {
  constructor(
    @InjectRepository(Transaccion)
    private transaccionRepo: Repository<Transaccion>,
  ) {}

  async crearTransaccion(dto: CrearTransaccionDto): Promise<any> {
    const transaccionId = uuidv4();
    const wompiPublicKey = process.env.WOMPI_PUBLIC_KEY;
    const integrityKey = process.env.WOMPI_INTEGRITY_KEY;

    if (!wompiPublicKey || !integrityKey) {
      throw new HttpException('Faltan llaves de Wompi en .env', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 🔹 1. Obtener acceptance_token desde Wompi
    const merchantResponse = await axios.get('https://api-sandbox.wompi.co/v1/merchants/' + wompiPublicKey);
    const acceptanceToken = merchantResponse.data.data.presigned_acceptance.acceptance_token;

    // 🔹 2. Calcular firma
    const amountInCents = dto.monto * 100;
    const reference = `ref_${transaccionId}`;
    const signatureString = `${reference}${amountInCents}COP${integrityKey}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    // 🔹 3. Guardar la transacción pendiente
    const transaccion = this.transaccionRepo.create({
      id_transaccion: transaccionId,
      id_wompi: reference,
      id_usuario: dto.id_usuario,
      id_cliente: dto.id_cliente,
      id_cita: dto.id_cita,
      monto: dto.monto,
      servicio: dto.servicio,
      metodo_pago: dto.metodo_pago || 'Tarjeta',
      prestador_servicio: dto.prestador_servicio || 'Plataforma',
      estado: 'pendiente',
    });

    await this.transaccionRepo.save(transaccion);

    // 🔹 4. Devolver todo al frontend
    return {
      publicKey: wompiPublicKey,
      acceptance_token: acceptanceToken,
      amount_in_cents: amountInCents,
      currency: 'COP',
      reference,
      signature,
      redirect_url: 'https://transaction-redirect.wompi.co/check',
    };
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