import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { noAuthenticatedGuard } from './no-authenticated.guard';

describe('noAuthenticatedGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => noAuthenticatedGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
