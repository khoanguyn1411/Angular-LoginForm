import { FormGroup, ValidationErrors } from '@angular/forms';
import { BehaviorSubject, first, map, Observable, switchMap, tap } from 'rxjs';
import { FormControlsFor } from './types/form-control';

const READABLE_VALIDATION_ERRORS = {
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

function mapErrors(formControlError: ValidationErrors | null) {
  if (formControlError) {
    const formControlKey = Object.keys(
      formControlError
    )[0] as keyof typeof READABLE_VALIDATION_ERRORS;
    const formControlValue = formControlError[formControlKey];
    return READABLE_VALIDATION_ERRORS[formControlKey](formControlValue);
  }
  return '';
}

export function getErrorsFromControls<T extends FormControlsFor<Record<string, any>>>(
  controls: T
): Record<keyof T, string> {
  const formControlKeys = Object.keys(controls);
  const errors = formControlKeys.reduce((acc, cur) => {
    const formControlError = controls[cur].errors;
    const errorKeyToText = mapErrors(formControlError);
    return { ...acc, [cur]: errorKeyToText };
  }, {});
  return errors as Record<keyof T, string>;
}

function resetFormControlOnChange<
  T extends FormControlsFor<Record<string, any>>
>(
  formErrors$: BehaviorSubject<Record<keyof T, string>>,
  form: FormGroup<T>,
  control: keyof T
): Observable<void> {
  const setFormErrorSideEffect$: Observable<void> = formErrors$.pipe(
    first(),
    tap((errors) => formErrors$.next({ ...errors, [control]: '' })),
    map(() => undefined)
  );

  return form.controls[control].statusChanges.pipe(
    switchMap(() => setFormErrorSideEffect$)
  );
}

export function createFormControlsChangeSideEffects<
  T extends FormControlsFor<Record<string, any>>
>(
  formErrors$: BehaviorSubject<Record<keyof T, string>>,
  form: FormGroup<T>
): Observable<void>[] {
  return Object.keys(form.controls).map((key) =>
    resetFormControlOnChange(formErrors$, form, key as keyof T)
  );
}
