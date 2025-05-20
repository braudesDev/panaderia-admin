import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutaDelDiaComponent } from './ruta-del-dia.component';

describe('RutaDelDiaComponent', () => {
  let component: RutaDelDiaComponent;
  let fixture: ComponentFixture<RutaDelDiaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutaDelDiaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RutaDelDiaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
