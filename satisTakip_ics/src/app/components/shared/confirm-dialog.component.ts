import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div
      class="modal fade"
      [id]="modalId"
      tabindex="-1"
      aria-labelledby="confirmModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="confirmModalLabel">{{ title }}</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            {{ message }}
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              İptal
            </button>
            <button
              type="button"
              class="btn btn-danger"
              data-bs-dismiss="modal"
              (click)="onConfirm.emit()"
            >
              {{ confirmButtonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  @Input() modalId = 'confirmModal';
  @Input() title = 'Onay';
  @Input() message = 'Bu işlemi gerçekleştirmek istediğinizden emin misiniz?';
  @Input() confirmButtonText = 'Evet';
  @Output() onConfirm = new EventEmitter<void>();
}
