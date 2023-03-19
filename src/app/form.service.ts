import { Injectable } from '@angular/core';
import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

const ERROR_TEXT = {
  required: () => 'This field must be filled.',
  email: () => 'This field must be an email.',
  requiredWithCustomMessage: ({ message }: { message: string }) => message,
  minlength: ({
    actualLength,
    requiredLength,
  }: {
    actualLength: number;
    requiredLength: number;
  }) =>
    `This field must include ${requiredLength} characters. Found only ${actualLength}`,
};

@Injectable({
  providedIn: 'root',
})
export class FormService {
  mapErrors(formControlError: object) {
    if (formControlError) {
      const formControlKey = Object.keys(
        formControlError
      )[0] as keyof typeof ERROR_TEXT;
      const formControlValue =
        formControlError[formControlKey as keyof typeof formControlError];
      return ERROR_TEXT[formControlKey](formControlValue);
    }
    return '';
  }

  getErrorsFromControls(controls: any) {
    const formControlKeys = Object.keys(controls);
    const errors = formControlKeys.reduce((acc, cur) => {
      const formControlError = controls[cur as keyof typeof controls].errors;
      const errorKeyToText = this.mapErrors(formControlError);
      return { ...acc, [cur]: errorKeyToText };
    }, {});
    return errors;
  }

  isRequired(message: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.value == null || control.value === '') {
        return {
          requiredWithCustomMessage: {
            message,
          },
        };
      }
      return null;
    };
  }
}
