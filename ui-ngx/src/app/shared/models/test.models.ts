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

import { BaseData } from '@shared/models/base-data';
import { TestId } from './id/test-id';
import { TenantId } from '@shared/models/id/tenant-id';
import { TestCredentialsId } from '@shared/models/id/test-credentials-id';
import { EntitySearchQuery } from '@shared/models/relation.models';
import * as _moment from 'moment';


export interface Test extends BaseData<TestId> {
  tenantId?: TenantId;
  name: string;
  road: string,
  accidentType: string,
  nrOfVehicles: string,
  description: string,
}

export interface TestInfo extends Test {
  customerTitle: string;
}


export interface TestCredentials extends BaseData<TestCredentialsId> {
  testId: TestId;
  credentialsId: string;
  credentialsValue: string;
}

export interface TestSearchQuery extends EntitySearchQuery {
  deviceTypes: Array<string>;
}

export interface ClaimRequest {
  secretKey: string;
}

export enum ClaimResponse {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  CLAIMED = 'CLAIMED'
}

export interface ClaimResult {
  test: Test;
  response: ClaimResponse;
}

// export const dayOfWeekTranslations = new Array<string>(
//   'device-profile.schedule-day.monday',
//   'device-profile.schedule-day.tuesday',
//   'device-profile.schedule-day.wednesday',
//   'device-profile.schedule-day.thursday',
//   'device-profile.schedule-day.friday',
//   'device-profile.schedule-day.saturday',
//   'device-profile.schedule-day.sunday'
// );


export function timeOfDayToUTCTimestamp(date: Date | number): number {
  if (typeof date === 'number' || date === null) {
    return 0;
  }
  return _moment.utc([1970, 0, 1, date.getHours(), date.getMinutes(), date.getSeconds(), 0]).valueOf();
}

export function utcTimestampToTimeOfDay(time = 0): Date {
  return new Date(time + new Date(time).getTimezoneOffset() * 60 * 1000);
}

function timeOfDayToMoment(date: Date | number): _moment.Moment {
  if (typeof date === 'number' || date === null) {
    return _moment([1970, 0, 1, 0, 0, 0, 0]);
  }
  return _moment([1970, 0, 1, date.getHours(), date.getMinutes(), 0, 0]);
}

export function getAlarmScheduleRangeText(startsOn: Date | number, endsOn: Date | number): string {
  const start = timeOfDayToMoment(startsOn);
  const end = timeOfDayToMoment(endsOn);
  if (start < end) {
    return `<span><span class="nowrap">${start.format('hh:mm A')}</span> – <span class="nowrap">${end.format('hh:mm A')}</span></span>`;
  } else if (start.valueOf() === 0 && end.valueOf() === 0 || start.isSame(_moment([1970, 0])) && end.isSame(_moment([1970, 0]))) {
    return '<span><span class="nowrap">12:00 AM</span> – <span class="nowrap">12:00 PM</span></span>';
  }
  return `<span><span class="nowrap">12:00 AM</span> – <span class="nowrap">${end.format('hh:mm A')}</span>` +
    ` and <span class="nowrap">${start.format('hh:mm A')}</span> – <span class="nowrap">12:00 PM</span></span>`;
}
