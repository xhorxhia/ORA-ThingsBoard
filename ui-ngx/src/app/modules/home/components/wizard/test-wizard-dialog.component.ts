///
/// Copyright © 2016-2021 The Thingsboard Authors
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///     http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

import { Component, Inject, OnDestroy, SkipSelf, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { AppState } from '@core/core.state';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, NgForm, Validators } from '@angular/forms';
import { DialogComponent } from '@shared/components/dialog.component';
import { Router } from '@angular/router';
import { MatHorizontalStepper } from '@angular/material/stepper';
import { AddEntityDialogData } from '@home/models/entity/entity-component.models';
import { BaseData, HasId } from '@shared/models/base-data';
import { EntityType } from '@shared/models/entity-type.models';
import { EntityId } from '@shared/models/id/entity-id';
import { Observable, of, Subscription, throwError } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { ErrorStateMatcher } from '@angular/material/core';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { MediaBreakpoints } from '@shared/models/constants';
import { deepTrim } from '@core/utils';
import { TestService } from '@app/core/http/test.service';

@Component({
  selector: 'tb-test-wizard',
  templateUrl: './test-wizard-dialog.component.html',
  providers: [],
  styleUrls: ['./test-wizard-dialog.component.scss']
})
export class TestWizardDialogComponent extends
  DialogComponent<TestWizardDialogComponent, boolean> implements OnDestroy, ErrorStateMatcher {

  @ViewChild('addTestWizardStepper', {static: true}) addTestWizardStepper: MatHorizontalStepper;

  selectedIndex = 0;
  showNext = true;

  createProfile = false;
  entityType = EntityType;
  testWizardFormGroup: FormGroup;
  private subscriptions: Subscription[] = [];
  labelPosition = 'end';

  constructor(protected store: Store<AppState>,
              protected router: Router,
              @Inject(MAT_DIALOG_DATA) public data: AddEntityDialogData<BaseData<EntityId>>,
              @SkipSelf() private errorStateMatcher: ErrorStateMatcher,
              public dialogRef: MatDialogRef<TestWizardDialogComponent, boolean>,
              private testService: TestService,
              private breakpointObserver: BreakpointObserver,
              private fb: FormBuilder) {
    super(store, router, dialogRef);
    this.testWizardFormGroup = this.fb.group({
      name: ['', Validators.required],
      road: ['', Validators.required],
      accidentType: ['', Validators.required],
      nrOfVehicles: ['', Validators.required],
      description: ['']
      }
    );



    this.labelPosition = this.breakpointObserver.isMatched(MediaBreakpoints['gt-sm']) ? 'end' : 'bottom';

    this.subscriptions.push(this.breakpointObserver
      .observe(MediaBreakpoints['gt-sm'])
      .subscribe((state: BreakpointState) => {
          if (state.matches) {
            this.labelPosition = 'end';
          } else {
            this.labelPosition = 'bottom';
          }
        }
      ));
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const originalErrorState = this.errorStateMatcher.isErrorState(control, form);
    const customErrorState = !!(control && control.invalid);
    return originalErrorState || customErrorState;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  previousStep(): void {
    this.addTestWizardStepper.previous();
  }

  nextStep(): void {
    this.addTestWizardStepper.next();
  }

  getFormLabel(index: number): string {
    if (index > 0) {
      if (!this.createProfile) {
        index += 3;
      }
    }
    switch (index) {
      case 0:
        return 'test.wizard.test-detailsss';
      case 1:
        return 'test-profile.transport-configuration';
      case 2:
        return 'test-profile.alarm-rules';
      case 3:
        return 'test-profile.test-provisioning';
      case 4:
        return 'test.credentials';
      case 5:
        return 'customer.customer';
    }
  }

  get maxStepperIndex(): number {
    return this.addTestWizardStepper?._steps?.length - 1;
  }


  add(): void {
    console.log(" adddddddddddd");

    this.createTest();

  }


  private createTest(): Observable<BaseData<HasId>> {
    console.log( this.testWizardFormGroup.get('name').value + " ------------");
    const test = {
      name: this.testWizardFormGroup.get('name').value,
      road: this.testWizardFormGroup.get('road').value,
      accidentType: this.testWizardFormGroup.get('accidentType').value,
      nrOfVehicles: this.testWizardFormGroup.get('nrOfVehicles').value,
      description: this.testWizardFormGroup.get('description').value,

      customerId: null
    };
    console.log("----:::  ", test)
    this.testService.saveTest(test).subscribe();
    return this.data.entitiesTableConfig.saveEntity(deepTrim(test));
  }


  allValid(): boolean {
    if (this.addTestWizardStepper.steps.find((item, index) => {
      if (item.stepControl.invalid) {
        item.interacted = true;
        this.addTestWizardStepper.selectedIndex = index;
        return true;
      } else {
        return false;
      }
    } )) {
      return false;
    } else {
      return true;
    }
  }

  changeStep($event: StepperSelectionEvent): void {
    this.selectedIndex = $event.selectedIndex;
    if (this.selectedIndex === this.maxStepperIndex) {
      this.showNext = false;
    } else {
      this.showNext = true;
    }
  }
}
