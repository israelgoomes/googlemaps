import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { Exemplo2Page } from './exemplo2.page';

describe('Exemplo2Page', () => {
  let component: Exemplo2Page;
  let fixture: ComponentFixture<Exemplo2Page>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Exemplo2Page ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(Exemplo2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
