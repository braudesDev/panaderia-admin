import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library'

@Component({
  selector: 'app-scanner-qr',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule],
  templateUrl: './scanner-qr.component.html',
  styleUrls: ['./scanner-qr.component.css']
})
export class ScannerQrComponent {

  formatsEnabled: BarcodeFormat[] = [BarcodeFormat.QR_CODE];

  @Output() qrEscaneado = new EventEmitter<string>();

  selectedDevice?: MediaDeviceInfo = undefined;
  qrContent: string | null = null;
  availableDevices: MediaDeviceInfo[] = [];

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.selectedDevice = devices[0]; // Usa la primera cámara disponible
  }

  // Este método debe llamarse cuando se detecte un código QR real
  onCodeResult(result: string): void {
    this.qrContent = result;
    this.qrEscaneado.emit(result);
    console.log('QR detectado:', result);
  }
}
