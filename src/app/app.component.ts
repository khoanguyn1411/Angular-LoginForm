import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { NonNullableFormBuilder, Validators } from '@angular/forms';
import { ignoreElements, merge, Subject, takeUntil, tap } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'demo-angular';

  fb = inject(NonNullableFormBuilder);
  form = this.initializeForm();
  userInfo = '';

  errors = {
    email: '',
    password: '',
    minlength: '',
  };

  private subscriptionManager$ = new Subject<void>();

  ngOnInit(): void {
    const formControlsChange$ = Object.keys(this.form.controls).map((key) =>
      this.resetFormControlOnChange(key)
    );
    merge(...formControlsChange$)
      .pipe(ignoreElements(), takeUntil(this.subscriptionManager$))
      .subscribe();
  }

  mapErrors(formControl: string) {
    const ERROR_TEXT = {
      required: 'This field must be filled.',
      email: 'This field must be an email.',
      minlength: 'This field must include 5 characters.',
    };
    return formControl
      ? ERROR_TEXT[formControl as keyof typeof ERROR_TEXT]
      : '';
  }

  onSubmit() {
    if (this.form.valid) {
      this.userInfo = JSON.stringify(this.form.getRawValue());
      return;
    }
    const errors = this.getErrorsFromControls(this.form.controls);
    this.errors = errors as typeof this.errors;
  }

  resetFormControlOnChange(control: any) {
    const _control = control as keyof typeof this.form.controls;
    return this.form.controls[_control].valueChanges.pipe(
      tap(() => (this.errors[_control] = ''))
    );
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

  initializeForm() {
    return this.fb.group({
      email: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [
        Validators.required,
        Validators.minLength(5),
      ]),
    });
  }

  ngOnDestroy(): void {
    this.subscriptionManager$.next();
    this.subscriptionManager$.complete();
  }
}
