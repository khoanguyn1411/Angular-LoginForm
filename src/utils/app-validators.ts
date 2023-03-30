import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

export namespace AppValidator {
  export function isRequired(message: string): ValidatorFn {
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
