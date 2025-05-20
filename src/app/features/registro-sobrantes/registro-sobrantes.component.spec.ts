import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroSobrantesComponent } from './registro-sobrantes.component';

describe('RegistroSobrantesComponent', () => {
  let component: RegistroSobrantesComponent;
  let fixture: ComponentFixture<RegistroSobrantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroSobrantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroSobrantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
