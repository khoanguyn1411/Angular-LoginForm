import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  NonNullableFormBuilder,
  Validators,
} from '@angular/forms';
import { ignoreElements, merge, Subject, takeUntil, tap } from 'rxjs';
import { FormService } from './form.service';

interface Form {
  email: FormControl<string>;
  password: FormControl<string>;
  shouldSaveInfo: FormControl<boolean>
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'demo-angular';

  form = this.initializeForm();
  userInfo = '';

  errors = {
    email: '',
    password: '',
  };

  private subscriptionManager$ = new Subject<void>();

  constructor(
    public fb: NonNullableFormBuilder,
    public formService: FormService
  ) {}

  ngOnInit(): void {
    const formControlsChange$ = Object.keys(this.form.controls).map((key) =>
      this.resetFormControlOnChange(key as keyof Form)
    );

    merge(...formControlsChange$)
      .pipe(ignoreElements(), takeUntil(this.subscriptionManager$))
      .subscribe();
  }

  onSubmit() {
    if (this.form.valid) {
      const formValues = this.form.getRawValue()
      const formValuesStringified = JSON.stringify(formValues);
      if(formValues.shouldSaveInfo){
        localStorage.setItem('userInfo', formValuesStringified);
      }
      this.userInfo = formValuesStringified;
      return;
    }
    const errors = this.formService.getErrorsFromControls(this.form.controls);
    this.errors = errors as typeof this.errors;
  }

  resetFormControlOnChange(control: keyof Form) {
    return this.form.controls[control].statusChanges.pipe(
      tap(() => {
        Object.assign(this.errors, { [control]: '' });
      })
    );
  }

  initializeForm() {
    const userInfo = localStorage.getItem('userInfo') ?? '';
    let userInfoStringified : any = {}
    if(userInfo !== ''){
      userInfoStringified = JSON.parse(userInfo)
    }
    return this.fb.group<Form>({
      email: this.fb.control(userInfoStringified.email, [
        Validators.required,
        Validators.email,
      ]),
      password: this.fb.control(userInfoStringified.password, [
        Validators.required,
        Validators.minLength(5),
      ]),
      shouldSaveInfo: this.fb.control(false)
    });
  }

  ngOnDestroy(): void {
    this.subscriptionManager$.next();
    this.subscriptionManager$.complete();
  }
}
