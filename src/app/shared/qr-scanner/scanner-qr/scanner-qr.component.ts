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

  scannerEnabled = false;

onCamerasFound(devices: MediaDeviceInfo[]): void {
  console.log('Cámaras encontradas:', devices);
  this.availableDevices = devices;
  if (!this.selectedDevice && devices.length > 0) {
    this.selectedDevice = devices[0];
  }
}


onDeviceSelect(event: Event) {
  const selectElement = event.target as HTMLSelectElement;
  const selectedIndex = selectElement.selectedIndex;
  this.selectedDevice = this.availableDevices[selectedIndex];
}


  // Este método debe llamarse cuando se detecte un código QR real
  onCodeResult(result: string): void {
    this.qrContent = result;
    this.qrEscaneado.emit(result);
    console.log('QR detectado:', result);
  }
}
