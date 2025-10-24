import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TransaccionesService } from '../services/transacciones.service';
import { CrearTransaccionDto } from '../dto/crear-transaccion.dto';

@Controller('transacciones')
export class TransaccionesController {
  constructor(private service: TransaccionesService) {}

  @Post()
  async crear(@Body() dto: CrearTransaccionDto) {
    return this.service.crearTransaccion(dto);
  }

  @Get('usuario/:id_usuario')
  async obtenerPorUsuario(@Param('id_usuario') id_usuario: string) {
    return this.service.obtenerTransaccionesPorUsuario(id_usuario);
  }

  @Get(':id/sincronizar')
  async sincronizar(@Param('id') id: string) {
    return this.service.sincronizarTransaccion(id);
  }

  @Get(':id')
  async obtener(@Param('id') id: string) {
    return this.service.obtenerTransaccion(id);
  }
}