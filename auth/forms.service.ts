import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form } from './form.entity';

export type FormField = 'basicInfo' | 'addressInfo' | 'professionalInfo' | 'documentInfo' | 'reviewInfo';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form)
    private formRepository: Repository<Form>,
  ) {}

  async createStage1(userId: string, data: any) {
    const form = this.formRepository.create({
      userId,
      basicInfo: data,
      currentStage: 2,
      status: 'IN_PROGRESS',
    });
    return this.formRepository.save(form);
  }

  async updateStage(id: string, stage: number, field: FormField, data: any) {
    const form = await this.formRepository.findOne({ where: { id } });
    if (!form) throw new NotFoundException('Form not found');

    // Dynamically update the specific info field based on the stage
    form[field as keyof Form] = data;

    // Increment stage only if moving to a newer stage
    form.currentStage = Math.max(form.currentStage, stage + 1);
    
    // Mark as completed only when the final stage is reached
    if (stage === 5 || field === 'reviewInfo') {
      form.status = 'COMPLETED';
    } else {
      form.status = 'IN_PROGRESS';
    }

    return this.formRepository.save(form);
  }

  async getAllForms(page: number = 1, limit: number = 10, status?: string) {
    const query = this.formRepository.createQueryBuilder('form');
    
    if (status) {
      query.where('form.status = :status', { status });
    }

    const [forms, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('form.updatedAt', 'DESC')
      .getManyAndCount();

    return {
      data: forms,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async resumeForm(id: string) {
    const form = await this.formRepository.findOne({ where: { id } });
    if (!form) throw new NotFoundException('Form not found');
    return form;
  }
}