import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  ignoreElements,
  merge,
  Subject,
  takeUntil,
} from 'rxjs';
import { LoginInfo } from 'src/models/LoginInfo';
import { AppValidator } from 'src/utils/app-validators';
import { FormControlsFor } from 'src/utils/types/form-control';
import {
  createFormControlsChangeSideEffects,
  FormErrors,
  getErrorsFromControls,
} from 'src/utils/form-validation';

type LoginForm = FormControlsFor<LoginInfo>;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  protected readonly form: FormGroup<LoginForm> = this.initializeForm();
  protected readonly formErrors$ = new BehaviorSubject<FormErrors<LoginInfo>>({
    email: '',
    password: '',
    shouldSaveInfo: '',
  });

  private readonly subscriptionManager$ = new Subject<void>();

  constructor(public fb: NonNullableFormBuilder) {}

  public ngOnInit() {
    const formControlsChange$ = createFormControlsChangeSideEffects(
      this.formErrors$,
      this.form
    );

    merge(...formControlsChange$)
      .pipe(ignoreElements(), takeUntil(this.subscriptionManager$))
      .subscribe();
  }

  protected onSubmit() {
    if (this.form.valid) {
      const formValues = this.form.getRawValue();
      const formValuesStringified = JSON.stringify(formValues);
      if (formValues.shouldSaveInfo) {
        localStorage.setItem('userInfo', formValuesStringified);
      }
      return;
    }
    const errors = getErrorsFromControls(this.form.controls);
    this.formErrors$.next(errors);
  }

  private initializeForm(): FormGroup<LoginForm> {
    const userInfo = localStorage.getItem('userInfo') ?? '';
    let userInfoStringified: any = {};
    if (userInfo !== '') {
      userInfoStringified = JSON.parse(userInfo);
    }
    return this.fb.group<LoginForm>({
      email: this.fb.control(userInfoStringified.email, [
        AppValidator.isRequired('Email is required.'),
        Validators.email,
      ]),
      password: this.fb.control(userInfoStringified.password, [
        Validators.required,
        Validators.minLength(5),
      ]),
      shouldSaveInfo: this.fb.control(false),
    });
  }

  public ngOnDestroy(): void {
    this.subscriptionManager$.next();
    this.subscriptionManager$.complete();
  }
}
