import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  mapErrors(formControl: string) {
    const ERROR_TEXT = {
      required: ' field must be filled.',
      email: 'This field must be an email.',
      minlength: 'This field must include 5 characters.',
    };
    if (formControl === '') {
      return '';
    }
    return ERROR_TEXT[formControl as keyof typeof ERROR_TEXT];
  }

  getErrorsFromControls(controls: any) {
    const formControlKeys = Object.keys(controls);
    const errors = formControlKeys.reduce((acc, cur) => {
      const formControlError = controls[cur as keyof typeof controls].errors;
      let errorKey = '';
      if (formControlError) {
        errorKey = Object.keys(formControlError)[0];
      }
      const errorKeyToText = this.mapErrors(errorKey);
      return { ...acc, [cur]: errorKeyToText };
    }, {});
    return errors;
  }
}
