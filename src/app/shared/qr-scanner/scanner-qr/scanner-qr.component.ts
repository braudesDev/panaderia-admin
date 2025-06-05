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
  console.log('QR detectado:', result);

  // Reproducir pitido y esperar antes de emitir
  this.playBeep(() => {
    this.qrEscaneado.emit(result);
  });
}


playBeep(onFinished?: () => void) {
  try {
    const audioCtx = new AudioContext();
    const oscillator = audioCtx.createOscillator();
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(1000, audioCtx.currentTime);
    oscillator.connect(audioCtx.destination);
    oscillator.start();

    setTimeout(() => {
      oscillator.stop();
      audioCtx.close();
      if (onFinished) onFinished(); // Ejecutar callback al terminar el pitido
    }, 100); // duración del beep
  } catch (error) {
    console.warn('No se pudo reproducir el pitido:', error);
    if (onFinished) onFinished(); // Emitir igual si hay error
  }
}


}
