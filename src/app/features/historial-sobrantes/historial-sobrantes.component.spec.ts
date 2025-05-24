import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialSobrantesComponent } from './historial-sobrantes.component';

describe('HistorialSobrantesComponent', () => {
  let component: HistorialSobrantesComponent;
  let fixture: ComponentFixture<HistorialSobrantesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialSobrantesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialSobrantesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
