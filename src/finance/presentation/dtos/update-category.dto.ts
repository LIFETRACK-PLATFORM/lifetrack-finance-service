import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  categoryId: string;

  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}

export class DeleteCategoryDto {
  @IsString()
  categoryId: string;
}
