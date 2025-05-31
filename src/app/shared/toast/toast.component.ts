import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.css']
})
export class ToastComponent {

  @Input() message = '';
  @Input() type: 'success' | 'error' = 'success';
  visible = false;

  show(msg: string, type: 'success' | 'error' = 'success', duration = 2500) {
    this.message = msg;
    this.type = type;
    this.visible = true;
    setTimeout(() => this.visible = false, duration);
  }

}
