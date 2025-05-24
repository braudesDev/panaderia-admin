import { TestBed } from '@angular/core/testing';

import { ClienteContextService } from '../services/cliente-context.service';

describe('ClienteContextService', () => {
  let service: ClienteContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClienteContextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
