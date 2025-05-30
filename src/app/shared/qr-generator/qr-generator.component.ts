import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QRCodeComponent } from 'angularx-qrcode';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-qr-generator',
  imports: [CommonModule, QRCodeComponent, FormsModule],
  templateUrl: './qr-generator.component.html',
  styleUrls: ['./qr-generator.component.css']
})
export class QrGeneratorComponent implements OnInit {
  @Input() qrData = '';

  ngOnInit(): void {
    // Si no recibe qrData, genera uno aleatorio
    if (!this.qrData) {
      this.qrData = crypto.randomUUID();
    }
  }

  descargarQr() {
    const qrCanvas = document.querySelector('qrcode canvas') as HTMLCanvasElement;
    if (qrCanvas) {
      const url = qrCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `qr-code-${this.qrData || 'nuevo'}.png`;
      a.click();
    }
  }
}

