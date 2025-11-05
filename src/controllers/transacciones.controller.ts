import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TransaccionesService } from '../services/transacciones.service';
import { CrearTransaccionDto } from '../dto/crear-transaccion.dto';

@Controller('transacciones')
export class TransaccionesController {
  // Inyectar el servicio de transacciones
  constructor(private service: TransaccionesService) {}

  // Obtener la clave pública de Wompi
  @Get('public-key')
  getPublicKey() {
    console.log('Public Key:', process.env.WOMPI_PUBLIC_KEY);
    return { publicKey: process.env.WOMPI_PUBLIC_KEY || 'NO_KEY_FOUND' };
  }
  
  // Crear una nueva transacción
  @Post()
  async crear(@Body() dto: CrearTransaccionDto) {
    return this.service.crearTransaccion(dto);
  }

  // Obtener transacciones por usuario
  @Get('usuario/:id_usuario')
  async obtenerPorUsuario(@Param('id_usuario') id_usuario: string) {
    return this.service.obtenerTransaccionesPorUsuario(id_usuario);
  }

  // Sincronizar el estado de una transacción
  @Get(':id/sincronizar')
  async sincronizar(@Param('id') id: string) {
    return this.service.sincronizarTransaccion(id);
  }

  // Obtener una transacción por ID
  @Get(':id')
  async obtener(@Param('id') id: string) {
    return this.service.obtenerTransaccion(id);
  }
}