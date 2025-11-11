import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '@/pages/dashboard/components/statswidget/services/stats.service';

interface Dependiente {
    cdperson: string;
    cod_emp: string;
    monto: string;
    nombre: string;
    parentesco: string;
}

@Component({
    selector: 'app-digital-id',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './digital-id.html',
    styleUrls: ['./digital-id.scss']
})
export class DigitalId implements OnInit {
    dependientes: Dependiente[] = [];
    isLoading: boolean = true;

    constructor(private statsService: StatsService) {}

    ngOnInit(): void {
        const storedValue = localStorage.getItem('user');

        if (!storedValue) {
            console.warn('No se encontró el usuario en localStorage');
            this.isLoading = false;
            return;
        }

        try {
            const user = JSON.parse(storedValue);
            const code_emp = user.details.Codigo;
            console.log('Código de empleado:', code_emp);
            this.getDependents(code_emp);
        } catch (error) {
            console.error('Error al parsear el usuario:', error);
            this.isLoading = false;
        }
    }

    getDependents(codigo: string): void {
        this.statsService.getDependents(codigo).subscribe({
            next: (data) => {
                this.dependientes = data;
                this.isLoading = false;
                console.log('Dependientes cargados:', this.dependientes);
            },
            error: (err) => {
                console.error('Error al obtener los dependientes:', err);
                this.isLoading = false;
                this.dependientes = [];
            }
        });
    }

    getInitials(nombre: string): string {
        if (!nombre) return '??';

        const words = nombre.trim().split(' ');
        if (words.length === 1) {
            return words[0].substring(0, 2).toUpperCase();
        }
        return (words[0][0] + words[words.length - 1][0]).toUpperCase();
    }

    downloadCarne(persona: Dependiente): void {
        console.log('Descargando carné de:', persona.nombre);

        alert(`Descargando carné de ${persona.nombre}\nCódigo: ${persona.cod_emp}`);

        this.generatePDF(persona);
    }

    private async generatePDF(persona: Dependiente): Promise<void> {
        const { jsPDF } = await import('jspdf');
        const html2canvas = (await import('html2canvas')).default;

        const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: [85.6, 53.98]
        });

        doc.setFillColor(38, 78, 114);
        doc.rect(0, 0, 85.6, 15, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(12);
        doc.text('ARS RESERVAS', 10, 8);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(persona.nombre, 10, 25);
        doc.text(`Código: ${persona.cod_emp}`, 10, 32);
        doc.text(`Parentesco: ${persona.parentesco}`, 10, 39);

        doc.save(`carne-${persona.cod_emp}.pdf`);
    }
}
