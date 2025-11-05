import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaccion } from '../entities/transaccion.entity';
import { CrearTransaccionDto } from '../dto/crear-transaccion.dto';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid'; // Para generar UUID
import crypto from 'crypto';

// Servicio para manejar la lógica de transacciones
@Injectable()
export class TransaccionesService {
  // Inyectar el repositorio de transacciones
  constructor(
    @InjectRepository(Transaccion)
    private transaccionRepo: Repository<Transaccion>,
  ) {}

  // Crear una nueva transacción
  async crearTransaccion(dto: CrearTransaccionDto): Promise<any> {
    const transaccionId = uuidv4(); // Generar un UUID para la transacción
    const wompiPublicKey = process.env.WOMPI_PUBLIC_KEY; // Clave pública de Wompi
    const integrityKey = process.env.WOMPI_INTEGRITY_KEY; // Clave de integridad de Wompi

    // Validar que las claves estén definidas
    if (!wompiPublicKey || !integrityKey) {
      throw new HttpException('Faltan llaves de Wompi en .env', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // 1. Obtener acceptance_token desde Wompi API
    const merchantResponse = await axios.get('https://api-sandbox.wompi.co/v1/merchants/' + wompiPublicKey);
    const acceptanceToken = merchantResponse.data.data.presigned_acceptance.acceptance_token;

    // 2. Calcular firma (signature)
    const amountInCents = dto.monto * 100;
    const reference = `ref_${transaccionId}`;
    const signatureString = `${reference}${amountInCents}COP${integrityKey}`;
    const signature = crypto.createHash('sha256').update(signatureString).digest('hex');

    // 3. Guardar la transacción pendiente
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

    // Guardar en la base de datos
    await this.transaccionRepo.save(transaccion);

    // 4. Devolver todo al frontend
    return {
      publicKey: wompiPublicKey, // Clave pública de Wompi
      acceptance_token: acceptanceToken, // Token de aceptación
      amount_in_cents: amountInCents, // Monto en centavos
      currency: 'COP',
      reference,
      signature,
      redirect_url: 'https://transaction-redirect.wompi.co/check', // URL de redirección al finalizar la transacción
    };
  }

  // Obtener una transacción por ID
  async obtenerTransaccion(id: string): Promise<Transaccion | null> {
    return this.transaccionRepo.findOne({ where: { id_transaccion: id } });
  }

  // Obtener transacciones por usuario
  async obtenerTransaccionesPorUsuario(id_usuario: string): Promise<Transaccion[]> {
    return this.transaccionRepo.find({ where: { id_usuario } });
  }

  // Sincronizar el estado de una transacción con Wompi
  async sincronizarTransaccion(id_transaccion: string): Promise<any> {
    const transaccion = await this.transaccionRepo.findOne({ where: { id_transaccion } });
    if (!transaccion) throw new HttpException('Transacción no encontrada', HttpStatus.NOT_FOUND);

    // Llamar a la API de Wompi para obtener el estado actual
    const response = await axios.get(`https://api.wompi.com/v1/transactions/${transaccion.id_wompi}`, {
      headers: { 'Authorization': `Bearer ${process.env.WOMPI_PRIVATE_KEY}` },
    });

    // Actualizar estado basado en la respuesta
    transaccion.estado = response.data.status === 'APPROVED' ? 'aprobado' : 'rechazado';
    await this.transaccionRepo.save(transaccion);
    return transaccion;
  }
}