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

import { Injectable } from '@angular/core';

import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import {
  checkBoxCell,
  DateEntityTableColumn,
  EntityTableColumn,
  EntityTableConfig,
  HeaderActionDescriptor
} from '@home/models/entity/entities-table-config.models';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { EntityType, entityTypeResources, entityTypeTranslations } from '@shared/models/entity-type.models';
import { AddEntityDialogData, EntityAction } from '@home/models/entity/entity-component.models';
import { TestComponent } from '@modules/home/pages/test/test.component';
import { forkJoin, Observable, of, Subject } from 'rxjs';
import { select, Store } from '@ngrx/store';
import { selectAuthUser } from '@core/auth/auth.selectors';
import { map, mergeMap, take, tap } from 'rxjs/operators';
import { AppState } from '@core/core.state';
import { Authority } from '@app/shared/models/authority.enum';
import { CustomerService } from '@core/http/customer.service';
import { Customer } from '@app/shared/models/customer.model';
import { NULL_UUID } from '@shared/models/id/has-uuid';
import { BroadcastService } from '@core/services/broadcast.service';
import { TestTableHeaderComponent } from '@modules/home/pages/test/test-table-header.component';
import { MatDialog } from '@angular/material/dialog';
import { DialogService } from '@core/services/dialog.service';

import {
  AddEntitiesToCustomerDialogComponent,
  AddEntitiesToCustomerDialogData
} from '../../dialogs/add-entities-to-customer-dialog.component';
import { TestTabsComponent } from '@home/pages/test/test-tabs.component';
import { HomeDialogsService } from '@home/dialogs/home-dialogs.service';
import { BaseData, HasId } from '@shared/models/base-data';
import { isDefinedAndNotNull } from '@core/utils';
import { TestInfo } from '@app/shared/models/test.models';
import { TestService } from '@app/core/http/test.service';
import { TestWizardDialogComponent } from '../../components/wizard/test-wizard-dialog.component';

@Injectable()
export class TestTableConfigResolver implements Resolve<EntityTableConfig<TestInfo>> {

  private readonly config: EntityTableConfig<TestInfo> = new EntityTableConfig<TestInfo>();

  private customerId: string;

  constructor(private store: Store<AppState>,
              private broadcast: BroadcastService,
              private testService: TestService,
              private customerService: CustomerService,
              private dialogService: DialogService,
              private homeDialogs: HomeDialogsService,
              private translate: TranslateService,
              private datePipe: DatePipe,
              private router: Router,
              private dialog: MatDialog) {

    this.config.entityType = EntityType.TEST;
    this.config.entityComponent = TestComponent;
   // this.config.entityTabsComponent = TestTabsComponent;
    this.config.entityTranslations = entityTypeTranslations.get(EntityType.TEST);
    this.config.entityResources = entityTypeResources.get(EntityType.TEST);

    this.config.addDialogStyle = {width: '600px'};

    this.config.deleteEntityTitle = test => this.translate.instant('test.delete-test-title', { testName: test.name });
    this.config.deleteEntityContent = () => this.translate.instant('test.delete-test-text');
    this.config.deleteEntitiesTitle = count => this.translate.instant('test.delete-tests-title', {count});
    this.config.deleteEntitiesContent = () => this.translate.instant('test.delete-tests-text');

    this.config.loadEntity = id => this.testService.getTestInfo(id.id);
    this.config.saveEntity = test => {
      return this.testService.saveTest(test).pipe(
        tap(() => {
          this.broadcast.broadcast('testSaved');
        }),
        mergeMap((savedTest) => this.testService.getTestInfo(savedTest.id.id)
        ));

    };
    //this.config.onEntityAction = action => this.onDeviceAction(action);
    this.config.detailsReadonly = () => this.config.componentsData.deviceScope === 'customer_user';

    this.config.headerComponent = TestTableHeaderComponent;

  }

  resolve(route: ActivatedRouteSnapshot): Observable<EntityTableConfig<TestInfo>> {
    const routeParams = route.params;
    console.log("helloo : ", route.data);

    this.config.componentsData = {
      deviceScope: route.data.devicesType,
    };
    this.customerId = routeParams.customerId;
    return this.store.pipe(select(selectAuthUser), take(1)).pipe(
      tap((authUser) => {
        if (authUser.authority === Authority.CUSTOMER_USER) {
          this.config.componentsData.deviceScope = 'customer_user';
          this.customerId = authUser.customerId;
        }
      }),
      mergeMap(() =>
        this.customerId ? this.customerService.getCustomer(this.customerId) : of(null as Customer)
      ),
      map((parentCustomer) => {
        if (parentCustomer) {
          if (parentCustomer.additionalInfo && parentCustomer.additionalInfo.isPublic) {
            this.config.tableTitle = this.translate.instant('customer.public-devices'); //Public Devices
          } else {
            this.config.tableTitle = parentCustomer.title + ': ' + this.translate.instant('test.test');
          }
        } else {
          this.config.tableTitle = this.translate.instant('test.test');
        }
        this.config.columns = this.configureColumns(this.config.componentsData.deviceScope);
        this.configureEntityFunctions(this.config.componentsData.deviceScope);
        this.config.addActionDescriptors = this.configureAddActions(this.config.componentsData.deviceScope);
        this.config.addEnabled = this.config.componentsData.deviceScope !== 'customer_user';
        this.config.entitiesDeleteEnabled = this.config.componentsData.deviceScope === 'tenant';
        this.config.deleteEnabled = () => this.config.componentsData.deviceScope === 'tenant';
        return this.config;
      })
    );
  }

  configureColumns(testScope: string): Array<EntityTableColumn<TestInfo>> {
    const columns: Array<EntityTableColumn<TestInfo>> = [
      new DateEntityTableColumn<TestInfo>('createdTime', 'common.created-time', this.datePipe, '150px'),
      new EntityTableColumn<TestInfo>('name', 'Name', '25%'),
      new EntityTableColumn<TestInfo>('road', 'Road', '25%'),
      new EntityTableColumn<TestInfo>('accidentType', 'Accident type', '25%'),
      new EntityTableColumn<TestInfo>('nrOfVehicles', 'Nr of Vehicles', '25%'),
      new EntityTableColumn<TestInfo>('description', 'Description', '25%'),
    ];
    return columns;
  }

  configureEntityFunctions(testScope: string): void {
    if (testScope === 'tenant') {
      this.config.entitiesFetchFunction = pageLink =>
        this.testService.getTenantTestInfos(pageLink);
      this.config.deleteEntity = id => this.testService.deleteTest(id.id);
    // } else {
    //   this.config.entitiesFetchFunction = pageLink =>
    //     this.testService.getCustomerDeviceInfosByDeviceProfileId(this.customerId, pageLink,
    //       this.config.componentsData.deviceProfileId !== null ?
    //         this.config.componentsData.deviceProfileId.id : '');
      //this.config.deleteEntity = id => this.testService.unassignDeviceFromCustomer(id.id);
    }
  }




  configureAddActions(testScope: string): Array<HeaderActionDescriptor> {
    const actions: Array<HeaderActionDescriptor> = [];
    // Add new test wizard is opened
    if (testScope === 'tenant') {
      actions.push(
        {
          name: this.translate.instant('test.add-test-text'),
          icon: 'insert_drive_file',
          isEnabled: () => true,
          onAction: ($event) => this.testWizard($event)
        }
      );
    }
    // if (deviceScope === 'customer') {
    //   actions.push(
    //     {
    //       name: this.translate.instant('device.assign-new-device'),
    //       icon: 'add',
    //       isEnabled: () => true,
    //       onAction: ($event) => this.addDevicesToCustomer($event)
    //     }
    //   );
    // }
    return actions;
  }


  testWizard($event: Event) {
    this.dialog.open<TestWizardDialogComponent, AddEntityDialogData<BaseData<HasId>>,
      boolean>(TestWizardDialogComponent, {
      disableClose: true,
      panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
      data: {
        entitiesTableConfig: this.config.table.entitiesTableConfig
      }
    }).afterClosed().subscribe(
      (res) => {
        if (res) {
          this.config.table.updateData();
        }
      }
    );
  }

  // addDevicesToCustomer($event: Event) {
  //   if ($event) {
  //     $event.stopPropagation();
  //   }
  //   this.dialog.open<AddEntitiesToCustomerDialogComponent, AddEntitiesToCustomerDialogData,
  //     boolean>(AddEntitiesToCustomerDialogComponent, {
  //     disableClose: true,
  //     panelClass: ['tb-dialog', 'tb-fullscreen-dialog'],
  //     data: {
  //       customerId: this.customerId,
  //       entityType: EntityType.TEST
  //     }
  //   }).afterClosed()
  //     .subscribe((res) => {
  //       if (res) {
  //         this.config.table.updateData();
  //       }
  //     });
  //}


}
