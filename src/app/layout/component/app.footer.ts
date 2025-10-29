import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer" style="color: #264E72;">
        Oficina virtual
        <a href="https://primeng.org" target="_blank" rel="noopener noreferrer" class="font-bold hover:underline" style="color: #264E72;">ARS RESERVAS</a>
    </div>`
})
export class AppFooter {}
