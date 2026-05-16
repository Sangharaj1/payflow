import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { FormsService } from './forms.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { BasicInfoDto, AddressDetailsDto, ProfessionalDetailsDto } from './dto/form-stages.dto';

@Controller('forms')
@UseGuards(JwtAuthGuard)
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post('stage-1')
  @UseInterceptors(FileInterceptor('dummy')) // Enforces multipart/form-data
  createStage1(@Req() req, @Body() data: BasicInfoDto) {
    return this.formsService.createStage1(req.user.sub, data);
  }

  @Post('stage-2/:id')
  @UseInterceptors(FileInterceptor('dummy'))
  updateStage2(@Param('id') id: string, @Body() data: AddressDetailsDto) {
    return this.formsService.updateStage(id, 2, 'addressInfo', data);
  }

  @Post('stage-3/:id')
  @UseInterceptors(FileInterceptor('dummy'))
  updateStage3(@Param('id') id: string, @Body() data: ProfessionalDetailsDto) {
    return this.formsService.updateStage(id, 3, 'professionalInfo', data);
  }

  @Post('stage-4/:id')
  @UseInterceptors(
    FilesInterceptor('documents', 5, {
      storage: memoryStorage(),
    }),
  )
  updateStage4(@Param('id') id: string, @UploadedFiles() files: Array<Express.Multer.File>) {
    const fileData = files.map(file => ({
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
    }));
    // Note: In production, upload file.buffer to S3 here and save the URL
    return this.formsService.updateStage(id, 4, 'documentInfo', {
      files: fileData,
      uploadedAt: new Date(),
      count: fileData.length
    });
  }

  @Post('stage-5/:id')
  @UseInterceptors(FileInterceptor('dummy'))
  updateStage5(@Param('id') id: string, @Body() data: any) {
    return this.formsService.updateStage(id, 5, 'reviewInfo', data);
  }

  @Get()
  getAllForms(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('status') status: string,
  ) {
    return this.formsService.getAllForms(page, limit, status);
  }

  @Get(':id')
  resumeForm(@Param('id') id: string) {
    return this.formsService.resumeForm(id);
  }
}