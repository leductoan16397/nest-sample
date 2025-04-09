import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { isMongoId } from 'class-validator';

@Injectable()
export class MongoIdPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): string {
    if (!value || !isMongoId(value)) {
      throw new BadRequestException(`Invalid MongoDB ID (reading '${metadata.type}.${metadata.data}')`);
    }

    return value;
  }
}
