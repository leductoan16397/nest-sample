import { ValidationOptions, registerDecorator, buildMessage } from 'class-validator';

export const isDayString = (text: string): boolean => {
  const day_regex = [
    /^(0{0,1}[1-9]|1[0-2])\/(0{0,1}[1-9]|[12][0-9]|3[01])\/\d{4}$/,
    /^(0{0,1}[1-9]|1[0-2])-(0{0,1}[1-9]|[12][0-9]|3[01])-\d{4}$/,
    /^\d{4}\/(0{0,1}[1-9]|1[0-2])\/(0{0,1}[1-9]|[12][0-9]|3[01])$/,
    /^\d{4}-(0{0,1}[1-9]|1[0-2])-(0{0,1}[1-9]|[12][0-9]|3[01])$/,
  ];

  return day_regex.some((d) => d.test(text));
};

export function IsDayString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isDayString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          if (typeof value !== 'string') {
            return false;
          }
          return isDayString(value);
        },
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + '$property phải có định dạng MM/DD/YYYY MM-DD-YYYY  YYYY/MM/DD YYYY-MM-DD ',
          validationOptions,
        ),
      },
    });
  };
}
