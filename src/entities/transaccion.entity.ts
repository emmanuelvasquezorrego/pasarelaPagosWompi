import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('transacciones')
export class Transaccion {
  @PrimaryColumn('uuid')
  id_transaccion: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  id_wompi: string;

  @Column({ type: 'uuid', nullable: true })
  id_evento_webhook: string;

  @Column({ type: 'uuid' })
  id_usuario: string;

  @Column({ type: 'uuid' })
  id_cliente: string;

  @Column({ type: 'uuid' })
  id_cita: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  monto: number;

  @Column({ type: 'varchar', length: 10, default: 'COP' })
  moneda: string;

  @Column({ type: 'enum', enum: ['pendiente', 'aprobado', 'rechazado'], default: 'pendiente' })
  estado: string;

  @Column({ type: 'varchar', length: 50 })
  metodo_pago: string;

  @Column({ type: 'varchar', length: 100 })
  prestador_servicio: string;

  @Column({ type: 'varchar', length: 150 })
  servicio: string;

  @CreateDateColumn()
  fecha_creacion: Date;

  @UpdateDateColumn()
  fecha_actualizacion: Date;
}