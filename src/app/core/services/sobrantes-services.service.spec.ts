import { TestBed } from '@angular/core/testing';

import { SobrantesServicesService } from './sobrantes-services.service';

describe('SobrantesServicesService', () => {
  let service: SobrantesServicesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SobrantesServicesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
