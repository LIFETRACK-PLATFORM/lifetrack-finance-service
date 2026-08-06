import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { CategoryKind } from '../../domain/entities/category.entity';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEnum(CategoryKind)
  kind: CategoryKind;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsString()
  color?: string;
}
