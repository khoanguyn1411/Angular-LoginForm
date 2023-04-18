import { FormControl } from '@angular/forms';

export type FormControlsFor<TSubject extends Record<string, any>> = {
  [key in keyof TSubject]: FormControl<TSubject[key]>;
};
