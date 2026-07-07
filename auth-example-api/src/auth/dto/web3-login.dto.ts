import { IsNotEmpty, IsString } from 'class-validator';

export class Web3LoginDto {
  @IsString({ message: 'walletAddress трябва да бъде текст.' })
  @IsNotEmpty({ message: 'walletAddress е задължително поле.' })
  declare walletAddress: string;

  @IsString({ message: 'signature трябва да бъде текст.' })
  @IsNotEmpty({ message: 'signature е задължително поле.' })
  declare signature: string;
}
