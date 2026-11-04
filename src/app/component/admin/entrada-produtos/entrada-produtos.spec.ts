import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EntradaProdutos } from './entrada-produtos';

describe('EntradaProdutos', () => {
  let component: EntradaProdutos;
  let fixture: ComponentFixture<EntradaProdutos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntradaProdutos],
    }).compileComponents();

    fixture = TestBed.createComponent(EntradaProdutos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
