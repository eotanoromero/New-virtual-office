import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../dashboard/components/statswidget/services/stats.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportType {
    id: string;
    title: string;
    description: string;
    icon: string;
    color: string;
    available: boolean;
}

interface DateRange {
    startDate: string;
    endDate: string;
}

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reports.html',
    styleUrl: './reports.scss'
})
export class Reports implements OnInit {
    userDetails: any = null;
    isGenerating: boolean = false;
    selectedReport: string = '';
    dateRange: DateRange = {
        startDate: '',
        endDate: ''
    };

    reportTypes: ReportType[] = [
        {
            id: 'autorizaciones',
            title: 'Reporte de Autorizaciones',
            description: 'Historial completo de autorizaciones médicas',
            icon: 'file-check',
            color: '#264e72',
            available: true
        },
        {
            id: 'reembolsos',
            title: 'Reporte de Reembolsos',
            description: 'Detalle de reembolsos solicitados y pagados',
            icon: 'dollar',
            color: '#00aef0',
            available: true
        },
        {
            id: 'dependientes',
            title: 'Reporte de Dependientes',
            description: 'Listado del núcleo familiar registrado',
            icon: 'users',
            color: '#f89420',
            available: true
        },
        {
            id: 'general',
            title: 'Reporte General',
            description: 'Resumen completo de toda la actividad',
            icon: 'chart',
            color: '#10b981',
            available: true
        }
    ];

    constructor(private statsService: StatsService) {}

    ngOnInit(): void {
        const storedValue = localStorage.getItem('user');
        if (storedValue) {
            try {
                const user = JSON.parse(storedValue);
                this.userDetails = user.details;
                this.setDefaultDates();
            } catch (error) {
                console.error('Error al parsear el usuario:', error);
            }
        }
    }

    setDefaultDates(): void {
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        this.dateRange.endDate = today.toISOString().split('T')[0];
        this.dateRange.startDate = thirtyDaysAgo.toISOString().split('T')[0];
    }

    selectReport(reportId: string): void {
        this.selectedReport = reportId;
    }

    async generateReport(): Promise<void> {
        if (!this.selectedReport || this.isGenerating) {
            return;
        }

        this.isGenerating = true;

        try {
            const reportType = this.reportTypes.find((r) => r.id === this.selectedReport);

            switch (this.selectedReport) {
                case 'autorizaciones':
                    await this.generateAutorizacionesReport();
                    break;
                case 'reembolsos':
                    await this.generateReembolsosReport();
                    break;
                case 'dependientes':
                    await this.generateDependientesReport();
                    break;
                case 'general':
                    await this.generateGeneralReport();
                    break;
            }

            alert(`✅ Reporte "${reportType?.title}" generado exitosamente`);
        } catch (error) {
            console.error('Error al generar el reporte:', error);
            alert('Error al generar el reporte. Por favor, intenta nuevamente.');
        } finally {
            this.isGenerating = false;
        }
    }

    private async generateAutorizacionesReport(): Promise<void> {
        const doc = new jsPDF('l', 'mm', 'a4');

        const primaryColor: [number, number, number] = [38, 78, 114];
        const accentColor: [number, number, number] = [0, 174, 240];

        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 297, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORTE DE AUTORIZACIONES', 15, 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Afiliado: ${this.userDetails?.Nombre || 'N/A'}`, 15, 23);
        doc.text(`Código: ${this.userDetails?.Codigo || 'N/A'}`, 15, 28);

        const fecha = new Date().toLocaleDateString('es-DO');
        doc.text(`Fecha: ${fecha}`, 220, 23);
        doc.text(`Período: ${this.dateRange.startDate} al ${this.dateRange.endDate}`, 220, 28);

        const codigo = this.userDetails?.Codigo || '';
        this.statsService.getAuthorizations(codigo).subscribe({
            next: (data) => {
                const autorizaciones = data.Table || [];

                const tableData = autorizaciones.map((auth: any) => [auth.AUTORIZACION, auth.FEC_APE, auth.FEC_SER, auth.TIPOPSS, auth.PSS, auth.DESCRIPCION, `RD$ ${auth.MONTO_AUTORIZADO}`]);

                autoTable(doc, {
                    head: [['Autorización', 'F. Apertura', 'F. Servicio', 'Tipo', 'Proveedor', 'Descripción', 'Monto']],
                    body: tableData,
                    startY: 40,
                    theme: 'striped',
                    headStyles: {
                        fillColor: accentColor,
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 9,
                        halign: 'center'
                    },
                    columnStyles: {
                        0: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
                        1: { cellWidth: 25, halign: 'center' },
                        2: { cellWidth: 25, halign: 'center' },
                        3: { cellWidth: 20, halign: 'center' },
                        4: { cellWidth: 50 },
                        5: { cellWidth: 80 },
                        6: { cellWidth: 25, halign: 'right', fontStyle: 'bold' }
                    }
                });

                const fechaArchivo = new Date().toISOString().split('T')[0];
                doc.save(`reporte-autorizaciones-${fechaArchivo}.pdf`);
            }
        });
    }

    private async generateReembolsosReport(): Promise<void> {
        const doc = new jsPDF('l', 'mm', 'a4');

        const primaryColor: [number, number, number] = [38, 78, 114];
        const accentColor: [number, number, number] = [0, 174, 240];

        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 297, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORTE DE REEMBOLSOS', 15, 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Afiliado: ${this.userDetails?.Nombre || 'N/A'}`, 15, 23);
        doc.text(`Código: ${this.userDetails?.Codigo || 'N/A'}`, 15, 28);

        const fecha = new Date().toLocaleDateString('es-DO');
        doc.text(`Fecha: ${fecha}`, 220, 23);
        doc.text(`Período: ${this.dateRange.startDate} al ${this.dateRange.endDate}`, 220, 28);

        const codigo = this.userDetails?.Codigo || '';
        this.statsService.getRefunds(codigo).subscribe({
            next: (data) => {
                const reembolsos = data.Table || data || [];

                const tableData = reembolsos.map((reembolso: any) => [reembolso.SECUENCIAL, reembolso.FEC_SER, reembolso.TIP_A_USO, reembolso.DESCRIPCION, reembolso.ESTATUS, `RD$ ${reembolso.MON_PAG}`]);

                autoTable(doc, {
                    head: [['Secuencial', 'F. Servicio', 'Tipo', 'Descripción', 'Estatus', 'Monto']],
                    body: tableData,
                    startY: 40,
                    theme: 'striped',
                    headStyles: {
                        fillColor: accentColor,
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 9,
                        halign: 'center'
                    },
                    columnStyles: {
                        0: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
                        1: { cellWidth: 28, halign: 'center' },
                        2: { cellWidth: 35, halign: 'center' },
                        3: { cellWidth: 100 },
                        4: { cellWidth: 30, halign: 'center' },
                        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
                    }
                });

                const fechaArchivo = new Date().toISOString().split('T')[0];
                doc.save(`reporte-reembolsos-${fechaArchivo}.pdf`);
            }
        });
    }

    private async generateDependientesReport(): Promise<void> {
        const doc = new jsPDF('p', 'mm', 'a4');

        const primaryColor: [number, number, number] = [38, 78, 114];
        const accentColor: [number, number, number] = [0, 174, 240];

        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 40, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORTE DE DEPENDIENTES', 15, 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Titular: ${this.userDetails?.Nombre || 'N/A'}`, 15, 25);
        doc.text(`Código: ${this.userDetails?.Codigo || 'N/A'}`, 15, 32);

        const fecha = new Date().toLocaleDateString('es-DO');
        doc.text(`Fecha: ${fecha}`, 150, 25);

        const codigo = this.userDetails?.Codigo || '';
        this.statsService.getDependents(codigo).subscribe({
            next: (data) => {
                const dependientes = data.Table || data || [];

                const tableData = dependientes.map((dep: any) => [dep.nombre, dep.parentesco, dep.cod_emp, dep.cdperson]);

                autoTable(doc, {
                    head: [['Nombre', 'Parentesco', 'Código Empleado', 'Código Persona']],
                    body: tableData,
                    startY: 45,
                    theme: 'striped',
                    headStyles: {
                        fillColor: accentColor,
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 10,
                        halign: 'center'
                    },
                    columnStyles: {
                        0: { cellWidth: 70 },
                        1: { cellWidth: 40, halign: 'center' },
                        2: { cellWidth: 40, halign: 'center', fontStyle: 'bold' },
                        3: { cellWidth: 40, halign: 'center', fontStyle: 'bold' }
                    }
                });

                const fechaArchivo = new Date().toISOString().split('T')[0];
                doc.save(`reporte-dependientes-${fechaArchivo}.pdf`);
            }
        });
    }

    private async generateGeneralReport(): Promise<void> {
        alert('🔄 Generando reporte general completo...\n\nEsta funcionalidad incluirá todos los datos combinados.');
    }

    getReportIcon(icon: string): string {
        const icons: { [key: string]: string } = {
            'file-check': '📋',
            dollar: '💰',
            users: '👥',
            chart: '📊'
        };
        return icons[icon] || '📄';
    }

    get selectedReportData(): ReportType | undefined {
        return this.reportTypes.find((r) => r.id === this.selectedReport);
    }
}
