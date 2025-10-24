import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('webhook_eventos')
export class WebhookEvento {
  @PrimaryColumn('uuid')
  id_evento: string;

  @Column({ type: 'varchar', length: 100 })
  id_wompi_evento: string;

  @Column({ type: 'json' })
  payload: object;

  @Column({ type: 'boolean', default: false })
  firma_valida: boolean;

  @Column({ type: 'boolean', default: false })
  procesado: boolean;

  @CreateDateColumn()
  fecha_recepcion: Date;
}