import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataBarang } from './data-barang';

describe('DataBarang', () => {
  let component: DataBarang;
  let fixture: ComponentFixture<DataBarang>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataBarang],
    }).compileComponents();

    fixture = TestBed.createComponent(DataBarang);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
