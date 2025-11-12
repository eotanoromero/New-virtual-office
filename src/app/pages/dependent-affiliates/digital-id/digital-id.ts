import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsService } from '@/pages/dashboard/components/statswidget/services/stats.service';
import jsPDF from 'jspdf';

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
                this.dependientes = data.Table || data || [];
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

    getParentescoColor(parentesco: string): string {
        const parentescoLower = parentesco?.toLowerCase() || '';
        if (parentescoLower === 'titular') {
            return 'titular';
        } else if (parentescoLower.includes('hijo') || parentescoLower.includes('hija')) {
            return 'hijo';
        } else if (parentescoLower.includes('conyugue') || parentescoLower.includes('esposo') || parentescoLower.includes('esposa')) {
            return 'conyugue';
        }
        return 'default';
    }

    async downloadCarne(persona: Dependiente): Promise<void> {
        console.log('Descargando carné de:', persona.nombre);
        await this.generatePDF(persona);
    }

    private async generatePDF(persona: Dependiente): Promise<void> {
        // Dimensiones de tarjeta de crédito: 85.6mm x 53.98mm
        const doc = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: [85.6, 53.98]
        });

        // Colores corporativos
        const primaryColor: [number, number, number] = [38, 78, 114]; // #264e72
        const accentColor: [number, number, number] = [0, 174, 240]; // #00aef0
        const orangeColor: [number, number, number] = [248, 148, 32]; // #f89420

        // Fondo del header (azul oscuro)
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 85.6, 16, 'F');

        // Línea naranja decorativa
        doc.setFillColor(orangeColor[0], orangeColor[1], orangeColor[2]);
        doc.rect(0, 16, 85.6, 1.5, 'F');

        // Cargar y agregar el logo
        try {
            const logo = await this.loadImage('short.png');
            doc.addImage(logo, 'PNG', 4, 3, 10, 10);
        } catch (error) {
            console.error('Error al cargar el logo:', error);
            // Si falla el logo, mostrar iniciales
            doc.setFillColor(255, 255, 255);
            doc.rect(4, 3, 10, 10, 'F');
            doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.text('ARS', 9, 9.5, { align: 'center' });
        }

        // Título "ARS RESERVAS"
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('ARS RESERVAS', 16, 9);

        // Subtítulo
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.text('Tu Salud, Nuestra Prioridad', 16, 13);

        // Badge "ARS" en la esquina superior derecha
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.roundedRect(70, 4, 12, 8, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('ARS', 76, 9.5, { align: 'center' });

        // Sección de información personal
        doc.setTextColor(0, 0, 0);

        // Avatar (círculo con iniciales)
        doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.circle(12, 28, 6, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        const initials = this.getInitials(persona.nombre);
        doc.text(initials, 12, 29.5, { align: 'center' });

        // Nombre
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        const nombreCorto = this.truncateText(persona.nombre, 35);
        doc.text(nombreCorto, 20, 25);

        // Parentesco badge
        const parentesco = persona.parentesco.toUpperCase();
        let badgeColor: [number, number, number] = [233, 236, 239]; // default gray
        if (parentesco === 'TITULAR') {
            badgeColor = orangeColor;
        } else if (parentesco.includes('HIJO') || parentesco.includes('HIJA')) {
            badgeColor = [16, 185, 129]; // green
        } else if (parentesco.includes('CONYUGUE') || parentesco.includes('ESPOSO') || parentesco.includes('ESPOSA')) {
            badgeColor = [139, 92, 246]; // purple
        }

        doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
        const badgeWidth = parentesco.length * 2 + 6;
        doc.roundedRect(20, 27, badgeWidth, 4.5, 1, 1, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(parentesco, 23, 30);

        // Cuadro de información
        doc.setDrawColor(233, 236, 239);
        doc.setFillColor(248, 249, 250);
        doc.roundedRect(4, 36, 77.6, 14, 2, 2, 'FD');

        // Detalles
        doc.setTextColor(108, 117, 125);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');

        doc.text('Código Empleado:', 6, 40);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(persona.cod_emp, 6, 44);

        doc.setTextColor(108, 117, 125);
        doc.setFont('helvetica', 'normal');
        doc.text('Código Persona:', 45, 40);
        doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(persona.cdperson, 45, 44);

        // Mensaje de validez
        doc.setTextColor(108, 117, 125);
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'italic');
        const fechaActual = new Date().toLocaleDateString('es-DO');
        doc.text(`Válido desde: ${fechaActual}`, 6, 48.5);

        // Guardar PDF
        const nombreArchivo = `carne-${persona.cod_emp}-${persona.nombre.replace(/\s+/g, '-')}.pdf`;
        doc.save(nombreArchivo);
    }

    private truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }

    private loadImage(url: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(img, 0, 0);
                    resolve(canvas.toDataURL('image/png'));
                } else {
                    reject(new Error('No se pudo obtener el contexto del canvas'));
                }
            };
            img.onerror = () => reject(new Error('Error al cargar la imagen'));
            img.src = url;
        });
    }
}
