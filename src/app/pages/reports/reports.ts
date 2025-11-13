import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../dashboard/components/statswidget/services/stats.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CapitalizePipe } from '../../shared/pipes/capitalize-pipe';

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
    imports: [CommonModule, FormsModule, CapitalizePipe],
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
            description: 'Historial completo de autorizaciones médicas realizadas en el período seleccionado',
            icon: 'health',
            color: '#264e72',
            available: true
        },
        {
            id: 'reembolsos',
            title: 'Reporte de Reembolsos',
            description: 'Detalle de reembolsos solicitados, procesados y pagados durante el período',
            icon: 'money',
            color: '#00aef0',
            available: true
        },
        {
            id: 'dependientes',
            title: 'Reporte de Dependientes',
            description: 'Listado completo del núcleo familiar registrado y sus datos de contacto',
            icon: 'users',
            color: '#f89420',
            available: true
        },
        {
            id: 'general',
            title: 'Reporte General',
            description: 'Resumen completo de toda la actividad médica y administrativa del período',
            icon: 'chart',
            color: '#63666A',
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

            console.log(`✅ Reporte "${reportType?.title}" generado exitosamente`);
        } catch (error) {
            console.error('❌ Error al generar el reporte:', error);
            alert('Error al generar el reporte. Por favor, intenta nuevamente.');
        } finally {
            this.isGenerating = false;
        }
    }

    /**
     * Parsea una fecha en formato DD/MM/YYYY a objeto Date
     */
    private parseApiDate(dateString: string): Date {
        if (!dateString) {
            console.warn('⚠️ parseApiDate: fecha vacía');
            return new Date();
        }

        // Formato esperado: DD/MM/YYYY
        const parts = dateString.split('/');
        if (parts.length === 3) {
            const day = parseInt(parts[0]);
            const month = parseInt(parts[1]) - 1; // Los meses en JS son 0-11
            const year = parseInt(parts[2]);

            const date = new Date(year, month, day);

            // Log solo en desarrollo (puedes comentar esto en producción)
            // console.log(`📅 Parseando: "${dateString}" → ${date.toLocaleDateString('es-DO')}`);

            return date;
        }

        console.warn(`⚠️ parseApiDate: formato no reconocido "${dateString}"`);
        return new Date(dateString);
    }

    /**
     * Parsea un monto que viene como string con formato "1,234.56"
     */
    private parseAmount(amountString: string | number): number {
        if (typeof amountString === 'number') return amountString;
        if (!amountString) return 0;

        // Remover comas y parsear
        const cleanAmount = amountString.toString().replace(/,/g, '');
        return parseFloat(cleanAmount) || 0;
    }

    /**
     * Filtra datos por rango de fechas
     */
    private filterByDateRange(data: any[], dateField: string): any[] {
        console.log('🔍 === INICIO FILTRADO POR FECHAS ===');
        console.log('📊 Total de registros a filtrar:', data.length);
        console.log('📅 Campo de fecha:', dateField);

        if (!this.dateRange.startDate || !this.dateRange.endDate) {
            console.log('⚠️ No hay rango de fechas, retornando todos los datos');
            return data;
        }

        const startDate = new Date(this.dateRange.startDate);
        startDate.setHours(0, 0, 0, 0); // Inicio del día

        const endDate = new Date(this.dateRange.endDate);
        endDate.setHours(23, 59, 59, 999); // Fin del día

        console.log('📆 Rango seleccionado:');
        console.log('   Inicio:', startDate.toLocaleDateString('es-DO'), '(', this.dateRange.startDate, ')');
        console.log('   Fin:', endDate.toLocaleDateString('es-DO'), '(', this.dateRange.endDate, ')');

        const filtered = data.filter((item, index) => {
            const dateString = item[dateField];
            const itemDate = this.parseApiDate(dateString);

            if (!itemDate) {
                console.warn(`❌ Registro ${index + 1}: No se pudo parsear fecha "${dateString}"`);
                return false;
            }

            itemDate.setHours(0, 0, 0, 0);

            const isIncluded = itemDate >= startDate && itemDate <= endDate;

            // Log de registros excluidos para debugging
            if (!isIncluded) {
                console.log(`❌ EXCLUIDO - Registro ${index + 1}:`, {
                    fecha: dateString,
                    parseada: itemDate.toLocaleDateString('es-DO'),
                    autorizacion: item.AUTORIZACION || item.SECUENCIAL || 'N/A',
                    razon: itemDate < startDate ? 'Anterior al inicio' : 'Posterior al final'
                });
            }

            return isIncluded;
        });

        console.log('✅ Filtrado completado:');
        console.log('   Incluidos:', filtered.length);
        console.log('   Excluidos:', data.length - filtered.length);
        console.log('🔍 === FIN FILTRADO POR FECHAS ===\n');

        return filtered;
    }

    /**
     * Crea el encabezado estándar para los PDFs
     */
    private createPDFHeader(doc: jsPDF, title: string, orientation: 'portrait' | 'landscape' = 'landscape'): void {
        const primaryColor: [number, number, number] = [38, 78, 114];
        const pageWidth = orientation === 'landscape' ? 297 : 210;

        // Header background
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, pageWidth, 40, 'F');

        // Logo placeholder (opcional - puedes agregar tu logo aquí)
        doc.setDrawColor(255, 255, 255);
        doc.setLineWidth(2);
        doc.roundedRect(15, 8, 25, 25, 3, 3, 'S');

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text(title, 45, 18);

        // Subtitle line
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Portal del Afiliado - ARS Reservas', 45, 25);

        // User info
        doc.setFontSize(10);
        doc.text(`Afiliado: ${this.userDetails?.Nombre || 'N/A'}`, 45, 32);

        // Date and period info
        const rightMargin = pageWidth - 15;
        const fecha = new Date().toLocaleDateString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.setFontSize(9);
        doc.text(`Generado: ${fecha}`, rightMargin, 18, { align: 'right' });
        doc.text(`Código: ${this.userDetails?.Codigo || 'N/A'}`, rightMargin, 25, { align: 'right' });
        doc.text(`Período: ${this.formatDate(this.dateRange.startDate)} al ${this.formatDate(this.dateRange.endDate)}`, rightMargin, 32, { align: 'right' });

        // Decorative line
        doc.setDrawColor(0, 174, 240);
        doc.setLineWidth(0.5);
        doc.line(15, 42, pageWidth - 15, 42);
    }

    /**
     * Formatea una fecha para mostrar
     */
    private formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-DO', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Genera reporte de autorizaciones con filtrado por fecha
     */
    private async generateAutorizacionesReport(): Promise<void> {
        const doc = new jsPDF('l', 'mm', 'a4');
        const accentColor: [number, number, number] = [0, 174, 240];

        this.createPDFHeader(doc, 'REPORTE DE AUTORIZACIONES', 'landscape');

        const codigo = this.userDetails?.Codigo || '';
        this.statsService.getAuthorizations(codigo).subscribe({
            next: (data) => {
                let autorizaciones = data.Table || [];

                // Filtrar por rango de fechas
                autorizaciones = this.filterByDateRange(autorizaciones, 'FEC_SER');

                if (autorizaciones.length === 0) {
                    doc.setTextColor(100, 100, 100);
                    doc.setFontSize(14);
                    doc.text('No se encontraron autorizaciones en el período seleccionado', 148.5, 100, { align: 'center' });
                } else {
                    // Calcular totales - CORREGIDO: usando parseAmount()
                    const totalAutorizaciones = autorizaciones.length;
                    const montoTotal = autorizaciones.reduce((sum: number, auth: any) => {
                        return sum + this.parseAmount(auth.MONTO_AUTORIZADO);
                    }, 0);

                    // Summary box
                    doc.setFillColor(240, 248, 255);
                    doc.roundedRect(15, 48, 267, 15, 2, 2, 'F');

                    doc.setTextColor(38, 78, 114);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Total de Autorizaciones: ${totalAutorizaciones}`, 20, 56);
                    doc.text(`Monto Total Autorizado: RD$ ${montoTotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 200, 56);

                    // Table data - CORREGIDO: usando parseAmount()
                    const tableData = autorizaciones.map((auth: any) => [
                        auth.AUTORIZACION || 'N/A',
                        auth.FEC_APE || 'N/A',
                        auth.FEC_SER || 'N/A',
                        auth.TIPOPSS || 'N/A',
                        (auth.PSS || 'N/A').substring(0, 35),
                        (auth.DESCRIPCION || 'N/A').substring(0, 50),
                        `RD$ ${this.parseAmount(auth.MONTO_AUTORIZADO).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ]);

                    autoTable(doc, {
                        head: [['Autorización', 'F. Apertura', 'F. Servicio', 'Tipo', 'Proveedor', 'Descripción', 'Monto']],
                        body: tableData,
                        startY: 68,
                        theme: 'grid',
                        headStyles: {
                            fillColor: accentColor,
                            textColor: [255, 255, 255],
                            fontStyle: 'bold',
                            fontSize: 9,
                            halign: 'center',
                            cellPadding: 3
                        },
                        bodyStyles: {
                            fontSize: 8,
                            cellPadding: 2.5
                        },
                        alternateRowStyles: {
                            fillColor: [245, 247, 250]
                        },
                        columnStyles: {
                            0: { cellWidth: 28, halign: 'center', fontStyle: 'bold', textColor: [38, 78, 114] },
                            1: { cellWidth: 25, halign: 'center' },
                            2: { cellWidth: 25, halign: 'center' },
                            3: { cellWidth: 20, halign: 'center' },
                            4: { cellWidth: 50, fontSize: 7 },
                            5: { cellWidth: 75, fontSize: 7 },
                            6: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: [248, 148, 32] }
                        },
                        margin: { left: 15, right: 15 },
                        didDrawPage: (data) => {
                            // Footer
                            const pageCount = (doc as any).internal.getNumberOfPages();
                            const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;

                            doc.setFontSize(8);
                            doc.setTextColor(128, 128, 128);
                            doc.text(`Página ${currentPage} de ${pageCount}`, 148.5, 200, { align: 'center' });
                        }
                    });
                }

                const fechaArchivo = new Date().toISOString().split('T')[0];
                doc.save(`autorizaciones-${fechaArchivo}.pdf`);
            },
            error: (error) => {
                console.error('Error al obtener autorizaciones:', error);
                this.isGenerating = false;
                throw error;
            }
        });
    }

    /**
     * Genera reporte de reembolsos con filtrado por fecha
     */
    private async generateReembolsosReport(): Promise<void> {
        const doc = new jsPDF('l', 'mm', 'a4');
        const accentColor: [number, number, number] = [0, 174, 240];

        this.createPDFHeader(doc, 'REPORTE DE REEMBOLSOS', 'landscape');

        const codigo = this.userDetails?.Codigo || '';
        this.statsService.getRefunds(codigo).subscribe({
            next: (data) => {
                let reembolsos = data.Table || data || [];

                // Filtrar por rango de fechas
                reembolsos = this.filterByDateRange(reembolsos, 'FEC_SER');

                if (reembolsos.length === 0) {
                    doc.setTextColor(100, 100, 100);
                    doc.setFontSize(14);
                    doc.text('No se encontraron reembolsos en el período seleccionado', 148.5, 100, { align: 'center' });
                } else {
                    // Calcular totales - CORREGIDO: usando parseAmount()
                    const totalReembolsos = reembolsos.length;
                    const montoTotal = reembolsos.reduce((sum: number, reemb: any) => {
                        return sum + this.parseAmount(reemb.MON_PAG);
                    }, 0);

                    // Summary box
                    doc.setFillColor(240, 248, 255);
                    doc.roundedRect(15, 48, 267, 15, 2, 2, 'F');

                    doc.setTextColor(38, 78, 114);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Total de Reembolsos: ${totalReembolsos}`, 20, 56);
                    doc.text(`Monto Total Pagado: RD$ ${montoTotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 200, 56);

                    // Table data - CORREGIDO: usando parseAmount()
                    const tableData = reembolsos.map((reembolso: any) => [
                        reembolso.SECUENCIAL || 'N/A',
                        reembolso.FEC_SER || 'N/A',
                        (reembolso.TIP_A_USO || 'N/A').substring(0, 25),
                        (reembolso.DESCRIPCION || 'N/A').substring(0, 60),
                        reembolso.ESTATUS || 'N/A',
                        `RD$ ${this.parseAmount(reembolso.MON_PAG).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    ]);

                    autoTable(doc, {
                        head: [['Secuencial', 'F. Servicio', 'Tipo', 'Descripción', 'Estatus', 'Monto Pagado']],
                        body: tableData,
                        startY: 68,
                        theme: 'grid',
                        headStyles: {
                            fillColor: accentColor,
                            textColor: [255, 255, 255],
                            fontStyle: 'bold',
                            fontSize: 9,
                            halign: 'center',
                            cellPadding: 3
                        },
                        bodyStyles: {
                            fontSize: 8,
                            cellPadding: 2.5
                        },
                        alternateRowStyles: {
                            fillColor: [245, 247, 250]
                        },
                        columnStyles: {
                            0: { cellWidth: 32, halign: 'center', fontStyle: 'bold', textColor: [38, 78, 114] },
                            1: { cellWidth: 28, halign: 'center' },
                            2: { cellWidth: 40, fontSize: 7 },
                            3: { cellWidth: 95, fontSize: 7 },
                            4: { cellWidth: 32, halign: 'center', fontSize: 7 },
                            5: { cellWidth: 35, halign: 'right', fontStyle: 'bold', textColor: [248, 148, 32] }
                        },
                        margin: { left: 15, right: 15 },
                        didDrawPage: (data) => {
                            const pageCount = (doc as any).internal.getNumberOfPages();
                            const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;

                            doc.setFontSize(8);
                            doc.setTextColor(128, 128, 128);
                            doc.text(`Página ${currentPage} de ${pageCount}`, 148.5, 200, { align: 'center' });
                        }
                    });
                }

                const fechaArchivo = new Date().toISOString().split('T')[0];
                doc.save(`reembolsos-${fechaArchivo}.pdf`);
            },
            error: (error) => {
                console.error('Error al obtener reembolsos:', error);
                this.isGenerating = false;
                throw error;
            }
        });
    }

    /**
     * Genera reporte de dependientes
     */
    private async generateDependientesReport(): Promise<void> {
        const doc = new jsPDF('p', 'mm', 'a4');
        const accentColor: [number, number, number] = [0, 174, 240];

        this.createPDFHeader(doc, 'REPORTE DE DEPENDIENTES', 'portrait');

        const codigo = this.userDetails?.Codigo || '';
        this.statsService.getDependents(codigo).subscribe({
            next: (data) => {
                const dependientes = data.Table || data || [];

                if (dependientes.length === 0) {
                    doc.setTextColor(100, 100, 100);
                    doc.setFontSize(14);
                    doc.text('No se encontraron dependientes registrados', 105, 100, { align: 'center' });
                } else {
                    // Summary box
                    doc.setFillColor(240, 248, 255);
                    doc.roundedRect(15, 48, 180, 12, 2, 2, 'F');

                    doc.setTextColor(38, 78, 114);
                    doc.setFontSize(11);
                    doc.setFont('helvetica', 'bold');
                    doc.text(`Total de Dependientes: ${dependientes.length}`, 20, 56);

                    // Table data
                    const tableData = dependientes.map((dep: any, index: number) => [(index + 1).toString(), dep.nombre || 'N/A', dep.parentesco || 'N/A', dep.cod_emp || 'N/A', dep.cdperson || 'N/A']);

                    autoTable(doc, {
                        head: [['#', 'Nombre Completo', 'Parentesco', 'Cód. Empleado', 'Cód. Persona']],
                        body: tableData,
                        startY: 65,
                        theme: 'grid',
                        headStyles: {
                            fillColor: accentColor,
                            textColor: [255, 255, 255],
                            fontStyle: 'bold',
                            fontSize: 10,
                            halign: 'center',
                            cellPadding: 3
                        },
                        bodyStyles: {
                            fontSize: 9,
                            cellPadding: 3
                        },
                        alternateRowStyles: {
                            fillColor: [245, 247, 250]
                        },
                        columnStyles: {
                            0: { cellWidth: 10, halign: 'center', fontStyle: 'bold', textColor: [38, 78, 114] },
                            1: { cellWidth: 70 },
                            2: { cellWidth: 35, halign: 'center' },
                            3: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
                            4: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
                        },
                        margin: { left: 15, right: 15 },
                        didDrawPage: (data) => {
                            const pageCount = (doc as any).internal.getNumberOfPages();
                            const currentPage = (doc as any).internal.getCurrentPageInfo().pageNumber;

                            doc.setFontSize(8);
                            doc.setTextColor(128, 128, 128);
                            doc.text(`Página ${currentPage} de ${pageCount}`, 105, 285, { align: 'center' });
                        }
                    });
                }

                const fechaArchivo = new Date().toISOString().split('T')[0];
                doc.save(`dependientes-${fechaArchivo}.pdf`);
            },
            error: (error) => {
                console.error('Error al obtener dependientes:', error);
                this.isGenerating = false;
                throw error;
            }
        });
    }

    /**
     * Genera reporte general completo con todos los datos
     */
    private async generateGeneralReport(): Promise<void> {
        const doc = new jsPDF('p', 'mm', 'a4');
        const primaryColor: [number, number, number] = [38, 78, 114];
        const accentColor: [number, number, number] = [0, 174, 240];
        const codigo = this.userDetails?.Codigo || '';

        // Portada
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 210, 297, 'F');

        // Logo placeholder
        doc.setDrawColor(255, 255, 255);
        doc.setFillColor(255, 255, 255);
        doc.setLineWidth(3);
        doc.roundedRect(70, 80, 70, 70, 5, 5, 'FD');

        // Title
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('REPORTE GENERAL', 105, 180, { align: 'center' });

        doc.setFontSize(16);
        doc.setFont('helvetica', 'normal');
        doc.text('Resumen Ejecutivo', 105, 192, { align: 'center' });

        // User info
        doc.setFontSize(12);
        doc.text(`${this.userDetails?.Nombre || 'N/A'}`, 105, 210, { align: 'center' });
        doc.text(`Código: ${this.userDetails?.Codigo || 'N/A'}`, 105, 220, { align: 'center' });

        // Period
        doc.setFontSize(11);
        doc.text(`Período: ${this.formatDate(this.dateRange.startDate)} al ${this.formatDate(this.dateRange.endDate)}`, 105, 235, { align: 'center' });

        // Date
        const fecha = new Date().toLocaleDateString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.setFontSize(10);
        doc.text(`Generado: ${fecha}`, 105, 270, { align: 'center' });

        // Obtener todos los datos
        Promise.all([
            new Promise((resolve) => {
                this.statsService.getAuthorizations(codigo).subscribe({
                    next: (data) => {
                        let auths = data.Table || [];
                        auths = this.filterByDateRange(auths, 'FEC_SER');
                        resolve(auths);
                    },
                    error: () => resolve([])
                });
            }),
            new Promise((resolve) => {
                this.statsService.getRefunds(codigo).subscribe({
                    next: (data) => {
                        let refunds = data.Table || data || [];
                        refunds = this.filterByDateRange(refunds, 'FEC_SER');
                        resolve(refunds);
                    },
                    error: () => resolve([])
                });
            }),
            new Promise((resolve) => {
                this.statsService.getDependents(codigo).subscribe({
                    next: (data) => resolve(data.Table || data || []),
                    error: () => resolve([])
                });
            })
        ])
            .then(([autorizaciones, reembolsos, dependientes]: any[]) => {
                // Nueva página - Resumen Ejecutivo
                doc.addPage();

                // Header
                doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                doc.rect(0, 0, 210, 35, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(18);
                doc.setFont('helvetica', 'bold');
                doc.text('RESUMEN EJECUTIVO', 105, 22, { align: 'center' });

                let yPos = 50;

                // Calcular estadísticas - CORREGIDO: usando parseAmount()
                const totalAutorizaciones = autorizaciones.length;
                const montoAutorizaciones = autorizaciones.reduce((sum: number, auth: any) => sum + this.parseAmount(auth.MONTO_AUTORIZADO), 0);

                const totalReembolsos = reembolsos.length;
                const montoReembolsos = reembolsos.reduce((sum: number, reemb: any) => sum + this.parseAmount(reemb.MON_PAG), 0);

                const totalDependientes = dependientes.length;

                // Boxes de estadísticas
                const boxWidth = 85;
                const boxHeight = 30;
                const boxMargin = 10;

                // Box 1 - Autorizaciones
                doc.setFillColor(38, 78, 114);
                doc.roundedRect(15, yPos, boxWidth, boxHeight, 3, 3, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('AUTORIZACIONES', 57.5, yPos + 10, { align: 'center' });
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                doc.text(totalAutorizaciones.toString(), 57.5, yPos + 22, { align: 'center' });

                // Box 2 - Monto Autorizaciones
                doc.setFillColor(0, 174, 240);
                doc.roundedRect(110, yPos, boxWidth, boxHeight, 3, 3, 'F');
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('MONTO AUTORIZADO', 152.5, yPos + 10, { align: 'center' });
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(`RD$ ${montoAutorizaciones.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 152.5, yPos + 22, { align: 'center' });

                yPos += boxHeight + boxMargin;

                // Box 3 - Reembolsos
                doc.setFillColor(248, 148, 32);
                doc.roundedRect(15, yPos, boxWidth, boxHeight, 3, 3, 'F');
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('REEMBOLSOS', 57.5, yPos + 10, { align: 'center' });
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                doc.text(totalReembolsos.toString(), 57.5, yPos + 22, { align: 'center' });

                // Box 4 - Monto Reembolsos
                doc.setFillColor(16, 185, 129);
                doc.roundedRect(110, yPos, boxWidth, boxHeight, 3, 3, 'F');
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('MONTO REEMBOLSADO', 152.5, yPos + 10, { align: 'center' });
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(`RD$ ${montoReembolsos.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 152.5, yPos + 22, { align: 'center' });

                yPos += boxHeight + boxMargin;

                // Box 5 - Dependientes
                doc.setFillColor(139, 92, 246);
                doc.roundedRect(15, yPos, boxWidth, boxHeight, 3, 3, 'F');
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('DEPENDIENTES', 57.5, yPos + 10, { align: 'center' });
                doc.setFontSize(20);
                doc.setFont('helvetica', 'bold');
                doc.text(totalDependientes.toString(), 57.5, yPos + 22, { align: 'center' });

                // Box 6 - Total General
                const montoTotal = montoAutorizaciones + montoReembolsos;
                doc.setFillColor(239, 68, 68);
                doc.roundedRect(110, yPos, boxWidth, boxHeight, 3, 3, 'F');
                doc.setFontSize(10);
                doc.setFont('helvetica', 'normal');
                doc.text('TOTAL GENERAL', 152.5, yPos + 10, { align: 'center' });
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(`RD$ ${montoTotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 152.5, yPos + 22, { align: 'center' });

                yPos += boxHeight + 20;

                // Tabla de resumen
                doc.setTextColor(38, 78, 114);
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text('Detalle por Categoría', 15, yPos);

                yPos += 10;

                const summaryData = [
                    ['Autorizaciones Médicas', totalAutorizaciones.toString(), `RD$ ${montoAutorizaciones.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                    ['Reembolsos Procesados', totalReembolsos.toString(), `RD$ ${montoReembolsos.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                    ['Dependientes Registrados', totalDependientes.toString(), '-'],
                    ['', '', ''],
                    ['TOTAL GENERAL', (totalAutorizaciones + totalReembolsos).toString(), `RD$ ${montoTotal.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
                ];

                autoTable(doc, {
                    head: [['Categoría', 'Cantidad', 'Monto']],
                    body: summaryData,
                    startY: yPos,
                    theme: 'grid',
                    headStyles: {
                        fillColor: accentColor,
                        textColor: [255, 255, 255],
                        fontStyle: 'bold',
                        fontSize: 11,
                        halign: 'center'
                    },
                    bodyStyles: {
                        fontSize: 10
                    },
                    columnStyles: {
                        0: { cellWidth: 100 },
                        1: { cellWidth: 40, halign: 'center' },
                        2: { cellWidth: 50, halign: 'right', fontStyle: 'bold' }
                    },
                    didParseCell: (data) => {
                        if (data.row.index === summaryData.length - 1) {
                            data.cell.styles.fillColor = [240, 248, 255];
                            data.cell.styles.textColor = [38, 78, 114];
                            data.cell.styles.fontStyle = 'bold';
                        }
                    }
                });

                // Footer con notas
                const finalY = (doc as any).lastAutoTable.finalY + 20;
                doc.setFontSize(9);
                doc.setTextColor(100, 100, 100);
                doc.setFont('helvetica', 'italic');
                doc.text('* Este reporte incluye únicamente los datos del período seleccionado', 15, finalY);
                doc.text('* Los montos están expresados en Pesos Dominicanos (RD$)', 15, finalY + 5);
                doc.text('* Para más detalles, consulte los reportes individuales de cada categoría', 15, finalY + 10);

                // Añadir detalles de autorizaciones si existen
                if (autorizaciones.length > 0) {
                    doc.addPage();
                    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                    doc.rect(0, 0, 210, 30, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text('DETALLE DE AUTORIZACIONES', 105, 20, { align: 'center' });

                    const authData = autorizaciones
                        .slice(0, 20)
                        .map((auth: any) => [
                            auth.AUTORIZACION || 'N/A',
                            auth.FEC_SER || 'N/A',
                            (auth.DESCRIPCION || 'N/A').substring(0, 50),
                            `RD$ ${this.parseAmount(auth.MONTO_AUTORIZADO).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        ]);

                    autoTable(doc, {
                        head: [['Autorización', 'Fecha', 'Descripción', 'Monto']],
                        body: authData,
                        startY: 40,
                        theme: 'grid',
                        headStyles: {
                            fillColor: accentColor,
                            fontSize: 9
                        },
                        bodyStyles: {
                            fontSize: 8
                        },
                        columnStyles: {
                            0: { cellWidth: 30, halign: 'center' },
                            1: { cellWidth: 25, halign: 'center' },
                            2: { cellWidth: 90 },
                            3: { cellWidth: 35, halign: 'right' }
                        }
                    });

                    if (autorizaciones.length > 20) {
                        doc.setFontSize(9);
                        doc.setTextColor(100, 100, 100);
                        doc.text(`* Mostrando las primeras 20 autorizaciones de ${autorizaciones.length} totales`, 15, (doc as any).lastAutoTable.finalY + 10);
                    }
                }

                // Añadir detalles de reembolsos si existen
                if (reembolsos.length > 0) {
                    doc.addPage();
                    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                    doc.rect(0, 0, 210, 30, 'F');
                    doc.setTextColor(255, 255, 255);
                    doc.setFontSize(16);
                    doc.setFont('helvetica', 'bold');
                    doc.text('DETALLE DE REEMBOLSOS', 105, 20, { align: 'center' });

                    const reembData = reembolsos
                        .slice(0, 20)
                        .map((reemb: any) => [
                            reemb.SECUENCIAL || 'N/A',
                            reemb.FEC_SER || 'N/A',
                            (reemb.DESCRIPCION || 'N/A').substring(0, 50),
                            reemb.ESTATUS || 'N/A',
                            `RD$ ${this.parseAmount(reemb.MON_PAG).toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        ]);

                    autoTable(doc, {
                        head: [['Secuencial', 'Fecha', 'Descripción', 'Estatus', 'Monto']],
                        body: reembData,
                        startY: 40,
                        theme: 'grid',
                        headStyles: {
                            fillColor: accentColor,
                            fontSize: 9
                        },
                        bodyStyles: {
                            fontSize: 8
                        },
                        columnStyles: {
                            0: { cellWidth: 25, halign: 'center' },
                            1: { cellWidth: 25, halign: 'center' },
                            2: { cellWidth: 75 },
                            3: { cellWidth: 25, halign: 'center' },
                            4: { cellWidth: 30, halign: 'right' }
                        }
                    });

                    if (reembolsos.length > 20) {
                        doc.setFontSize(9);
                        doc.setTextColor(100, 100, 100);
                        doc.text(`* Mostrando los primeros 20 reembolsos de ${reembolsos.length} totales`, 15, (doc as any).lastAutoTable.finalY + 10);
                    }
                }

                // Guardar PDF
                const fechaArchivo = new Date().toISOString().split('T')[0];
                doc.save(`reporte-general-${fechaArchivo}.pdf`);
                this.isGenerating = false;
            })
            .catch((error) => {
                console.error('Error al generar reporte general:', error);
                this.isGenerating = false;
                alert('Error al generar el reporte general. Por favor, intenta nuevamente.');
            });
    }

    /**
     * Obtiene el gradiente CSS para un color base
     */
    getReportGradient(color: string): string {
        const gradients: { [key: string]: string } = {
            '#264e72': 'linear-gradient(135deg, #264e72 0%, #1a3952 100%)',
            '#00aef0': 'linear-gradient(135deg, #00aef0 0%, #0086b8 100%)',
            '#f89420': 'linear-gradient(135deg, #f89420 0%, #d47915 100%)',
            '#10b981': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            '#8b5cf6': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            '#ef4444': 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            '#5B5E61': 'linear-gradient(135deg, #5B5E61 0%, #3f4245 100%)'
        };

        return gradients[color] || `linear-gradient(135deg, ${color} 0%, ${color} 100%)`;
    }

    /**
     * Getter que retorna los datos del reporte seleccionado
     */
    get selectedReportData(): ReportType | undefined {
        return this.reportTypes.find((r) => r.id === this.selectedReport);
    }
}
