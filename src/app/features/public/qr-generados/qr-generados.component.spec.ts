import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QrGeneradosComponent } from './qr-generados.component';

describe('QrGeneradosComponent', () => {
  let component: QrGeneradosComponent;
  let fixture: ComponentFixture<QrGeneradosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QrGeneradosComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QrGeneradosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
