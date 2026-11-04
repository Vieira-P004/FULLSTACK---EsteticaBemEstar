import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PedidosEmAberto } from './pedidos-em-aberto';

describe('PedidosEmAberto', () => {
  let component: PedidosEmAberto;
  let fixture: ComponentFixture<PedidosEmAberto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PedidosEmAberto],
    }).compileComponents();

    fixture = TestBed.createComponent(PedidosEmAberto);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
