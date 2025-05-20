import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidoAnticipadoComponent } from './pedido-anticipado.component';

describe('PedidoAnticipadoComponent', () => {
  let component: PedidoAnticipadoComponent;
  let fixture: ComponentFixture<PedidoAnticipadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidoAnticipadoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PedidoAnticipadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
