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
import { defaultHttpOptionsFromConfig, RequestConfig } from './http-utils';
import { Observable, ReplaySubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PageLink } from '@shared/models/page/page-link';
import { PageData } from '@shared/models/page/page-data';
import {
  ClaimRequest,
  ClaimResult,
  Test,
  TestCredentials,
  TestInfo,
  TestSearchQuery
} from '@app/shared/models/test.models';
import { EntitySubtype } from '@app/shared/models/entity-type.models';
import { AuthService } from '@core/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class TestService {

  constructor(
    private http: HttpClient
  ) { }

  public getTenantTestInfos(pageLink: PageLink, type: string = '',
                              config?: RequestConfig): Observable<PageData<TestInfo>> {
    return this.http.get<PageData<TestInfo>>(`/api/tenant/testInfos${pageLink.toQuery()}&type=${type}`,
      defaultHttpOptionsFromConfig(config));
  }

  public getTest(testId: string, config?: RequestConfig): Observable<Test> {
    return this.http.get<Test>(`/api/test/${testId}`, defaultHttpOptionsFromConfig(config));
  }

  public getTests(testIds: Array<string>, config?: RequestConfig): Observable<Array<Test>> {
    return this.http.get<Array<Test>>(`/api/tests?testIds=${testIds.join(',')}`, defaultHttpOptionsFromConfig(config));
  }

  public getTestInfo(testId: string, config?: RequestConfig): Observable<TestInfo> {
    return this.http.get<TestInfo>(`/api/test/info/${testId}`, defaultHttpOptionsFromConfig(config));
  }

  public saveTest(test: Test, config?: RequestConfig): Observable<Test> {
    return this.http.post<Test>('/api/test', test, defaultHttpOptionsFromConfig(config));
  }

  public deleteTest(testId: string, config?: RequestConfig) {
    return this.http.delete(`/api/test/${testId}`, defaultHttpOptionsFromConfig(config));
  }

  public getTestTypes(config?: RequestConfig): Observable<Array<EntitySubtype>> {
    return this.http.get<Array<EntitySubtype>>('/api/test/types', defaultHttpOptionsFromConfig(config));
  }

  public sendOneWayRpcCommand(testId: string, requestBody: any, config?: RequestConfig): Observable<any> {
    return this.http.post<Test>(`/api/plugins/rpc/oneway/${testId}`, requestBody, defaultHttpOptionsFromConfig(config));
  }

  public sendTwoWayRpcCommand(testId: string, requestBody: any, config?: RequestConfig): Observable<any> {
    return this.http.post<Test>(`/api/plugins/rpc/twoway/${testId}`, requestBody, defaultHttpOptionsFromConfig(config));
  }

  public findByQuery(query: TestSearchQuery,
                     config?: RequestConfig): Observable<Array<Test>> {
    return this.http.post<Array<Test>>('/api/tests', query, defaultHttpOptionsFromConfig(config));
  }

  public findByName(testName: string, config?: RequestConfig): Observable<Test> {
    return this.http.get<Test>(`/api/tenant/tests?testName=${testName}`, defaultHttpOptionsFromConfig(config));
  }

  public claimTest(testName: string, claimRequest: ClaimRequest,
                     config?: RequestConfig): Observable<ClaimResult> {
    return this.http.post<ClaimResult>(`/api/customer/test/${testName}/claim`, claimRequest, defaultHttpOptionsFromConfig(config));
  }

  public unclaimTest(testName: string, config?: RequestConfig) {
    return this.http.delete(`/api/customer/test/${testName}/claim`, defaultHttpOptionsFromConfig(config));
  }

  ////////////////////////// hiqi
  // public getTenantDeviceInfosByDeviceProfileId(pageLink: PageLink, deviceProfileId: string = '',
  //                                              config?: RequestConfig): Observable<PageData<TestInfo>> {
  //   return this.http.get<PageData<TestInfo>>(`/api/tenant/deviceInfos${pageLink.toQuery()}&deviceProfileId=${deviceProfileId}`,
  //     defaultHttpOptionsFromConfig(config));
  // }
  //
  // public getCustomerDeviceInfosByDeviceProfileId(customerId: string, pageLink: PageLink, deviceProfileId: string = '',
  //                                                config?: RequestConfig): Observable<PageData<TestInfo>> {
  //   return this.http.get<PageData<TestInfo>>(`/api/customer/${customerId}/deviceInfos${pageLink.toQuery()}&deviceProfileId=${deviceProfileId}`,
  //     defaultHttpOptionsFromConfig(config));
  // }
  // public getTenantDeviceInfos(pageLink: PageLink, type: string = '',
  //                             config?: RequestConfig): Observable<PageData<TestInfo>> {
  //   return this.http.get<PageData<TestInfo>>(`/api/tenant/deviceInfos${pageLink.toQuery()}&type=${type}`,
  //     defaultHttpOptionsFromConfig(config));
  // }
  //
  // public deleteDevice(deviceId: string, config?: RequestConfig) {
  //   return this.http.delete(`/api/device/${deviceId}`, defaultHttpOptionsFromConfig(config));
  // }
}
