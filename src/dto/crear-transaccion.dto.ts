import { IsString, IsUUID, IsNumber, IsOptional } from 'class-validator';

// DTO para crear una nueva transacción
export class CrearTransaccionDto {
  @IsNumber()
  monto: number;

  @IsString()
  servicio: string;

  @IsUUID()
  id_usuario: string;

  @IsUUID()
  id_cliente: string;

  @IsUUID()
  id_cita: string;

  @IsString()
  @IsOptional()
  metodo_pago?: string;

  @IsString()
  @IsOptional()
  prestador_servicio?: string;

  @IsString()
  @IsOptional()
  customer_email?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}