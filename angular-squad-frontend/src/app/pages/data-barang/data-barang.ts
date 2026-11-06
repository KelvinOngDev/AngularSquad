import { Component } from '@angular/core';

@Component({
  selector: 'app-data-barang',
  imports: [],
  templateUrl: './data-barang.html',
  styleUrl: './data-barang.css',
})
export class DataBarang {
  protected readonly barangList = [
    { id: 1, kodeBarang: 'BRG-001', namaBarang: 'Keyboard', harga: 250000, stok: 12 },
    { id: 2, kodeBarang: 'BRG-002', namaBarang: 'Mouse', harga: 125000, stok: 24 },
  ];
}
