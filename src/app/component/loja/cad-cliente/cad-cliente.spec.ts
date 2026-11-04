import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CadCliente } from './cad-cliente';

describe('CadCliente', () => {
  let component: CadCliente;
  let fixture: ComponentFixture<CadCliente>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadCliente],
    }).compileComponents();

    fixture = TestBed.createComponent(CadCliente);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
