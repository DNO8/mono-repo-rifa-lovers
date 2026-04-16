import type { Pack } from '@prisma/client';
import type { PackResponseDto } from '../dto/pack-response.dto';
export declare function mapPackToDto(pack: Pack): PackResponseDto;
