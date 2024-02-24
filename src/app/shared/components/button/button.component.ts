import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [],
  template: `
      <button (click)="click.emit()"> {{text}} </button>
  `,
  styles: ``
})
export class ButtonComponent {
    @Output() click = new EventEmitter<void>();

    @Input({ required: true }) text!: string 
    @Input() type?: 'secondary' | 'contrast'
}
