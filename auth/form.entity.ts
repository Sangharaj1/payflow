import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ default: 1 })
  currentStage: number;

  @Column({ default: 'IN_PROGRESS' })
  status: string;

  @Column({ type: 'json', nullable: true })
  basicInfo: any;

  @Column({ type: 'json', nullable: true })
  addressInfo: any;

  @Column({ type: 'json', nullable: true })
  professionalInfo: any;

  @Column({ type: 'json', nullable: true })
  documentInfo: any;

  @Column({ type: 'json', nullable: true })
  reviewInfo: any;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}