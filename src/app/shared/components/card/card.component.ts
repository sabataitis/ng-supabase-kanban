import { Component } from '@angular/core';

@Component({
    selector: 'app-card',
    standalone: true,
    styleUrl: './card.component.scss',
    template: `
      <div class="card">
          <ng-content> </ng-content>
      </div>
  `,
})
export class CardComponent {}
