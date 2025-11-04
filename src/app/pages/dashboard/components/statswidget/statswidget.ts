import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from './services/stats.service';

@Component({
    selector: 'app-statswidget',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './statswidget.html',
    styleUrls: ['./statswidget.scss']
})
export class Statswidget implements OnInit {
    consumo: any = null;

    constructor(private statsService: StatsService) {}

    ngOnInit(): void {
        const storedValue = localStorage.getItem('user');
        // console.log('Valor:', storedValue);

        if (!storedValue) {
            console.warn('No se encontró el usuario en localStorage');
            return;
        }

        const user = JSON.parse(storedValue);
        // console.log('Usuario recuperado:', user);

        const codigo = user.details.Cdperson;
        const ramo = user.details.Ramo;
        const fecha = user.details.Fecha;

        this.statsService.getMedicineAvailabily(codigo, ramo, fecha).subscribe({
            next: (data) => {
                // console.log('Datos recibidos del servicio:', data);
                this.consumo = data;
            },
            error: (err) => console.error('Error en la petición:', err)
        });
    }
}
