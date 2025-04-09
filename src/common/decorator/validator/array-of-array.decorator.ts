import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

export const isArrayOfArrays = (value: unknown): boolean => {
  // Kiểm tra xem value có phải là mảng không
  if (!Array.isArray(value)) {
    return false;
  }
  // Kiểm tra xem mỗi phần tử trong mảng có phải là mảng không
  return value.every((item) => Array.isArray(item));
};

// Custom validator để kiểm tra mảng 2 chiều
@ValidatorConstraint({ name: 'isArrayOfArrays', async: false })
class ArrayOfArraysConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return isArrayOfArrays(value);
  }

  defaultMessage(args: ValidationArguments): string {
    return `${args.property} must be an array of arrays`;
  }
}

// Tạo decorator để sử dụng constraint
export function IsArrayOfArraysConstraint(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: ArrayOfArraysConstraint,
    });
  };
}
