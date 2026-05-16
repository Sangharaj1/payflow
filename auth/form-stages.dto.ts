import { IsString, IsNotEmpty, IsOptional, IsEmail, IsObject } from 'class-validator';

export class BasicInfoDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;
}

export class AddressDetailsDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  zipCode: string;
}

export class ProfessionalDetailsDto {
  @IsObject()
  experience: Record<string, any>;
}