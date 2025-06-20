import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsEnum, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ROLES } from '../../../server/middleware/auth';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  businessName: string;

  @IsString()
  businessType: string;

  @IsString()
  contactPerson: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  tradeLicense?: string;

  @IsNumber()
  @IsOptional()
  establishedYear?: number;

  @IsNumber()
  @IsOptional()
  employeeCount?: number;

  @IsNumber()
  @IsOptional()
  monthlyRevenue?: number;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class ResetPasswordRequestDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  contactPerson?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsString()
  @IsOptional()
  tradeLicense?: string;

  @IsNumber()
  @IsOptional()
  establishedYear?: number;

  @IsNumber()
  @IsOptional()
  employeeCount?: number;

  @IsNumber()
  @IsOptional()
  monthlyRevenue?: number;
}
