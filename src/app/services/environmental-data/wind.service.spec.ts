import {TestBed} from '@angular/core/testing';

import {WindService} from './wind.service';

describe('WindService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WindService = TestBed.get(WindService);
    expect(service).toBeTruthy();
  });
});
