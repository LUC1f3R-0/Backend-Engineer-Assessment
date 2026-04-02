import { ApiProperty } from '@nestjs/swagger';

export class ProductItemDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'MKP-ELC-001' })
  sku: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ example: 'Electronics' })
  category: string;

  @ApiProperty({ type: [String], example: ['wireless', 'bluetooth'] })
  tags: string[];

  @ApiProperty({ example: '109.99', description: 'Decimal as string' })
  price: string;

  @ApiProperty({ example: 142 })
  stock: number;

  @ApiProperty({ format: 'uri' })
  imageUrl: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class ProductsPageResponseDto {
  @ApiProperty({ type: [ProductItemDto] })
  items: ProductItemDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 8 })
  limit: number;

  @ApiProperty({ example: 50 })
  totalItems: number;

  @ApiProperty({ example: 7 })
  totalPages: number;
}
