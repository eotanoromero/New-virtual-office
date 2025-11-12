import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../dashboard/components/statswidget/services/stats.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CapitalizePipe } from '@/shared/pipes/capitalize-pipe';

interface Autorizacion {
    AUTORIZACION: string;
    FEC_APE: string;
    FEC_SER: string;
    TIPOPSS: string;
    PSS: string;
    DESCRIPCION: string;
    MONTO_AUTORIZADO: string;
}

@Component({
    selector: 'app-authorization',
    standalone: true,
    imports: [CommonModule, FormsModule, CapitalizePipe],
    templateUrl: './authorization.html',
    styleUrl: './authorization.scss'
})
export class Authorization {
    autorizaciones: Autorizacion[] = [];
    autorizacionesFiltradas: Autorizacion[] = [];
    isLoading: boolean = true;

    // Filtros
    filtroGlobal: string = '';
    filtros: any = {
        AUTORIZACION: '',
        FEC_APE: '',
        FEC_SER: '',
        TIPOPSS: '',
        PSS: '',
        DESCRIPCION: '',
        MONTO_AUTORIZADO: ''
    };

    // Paginación
    paginaActual: number = 1;
    itemsPorPagina: number = 10;
    totalPaginas: number = 0;
    opcionesPaginas: number[] = [5, 10, 20, 50, 100];

    // Ordenamiento
    columnaOrden: keyof Autorizacion | '' = '';
    ordenAscendente: boolean = true;

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
            this.getAuthorizations(code_emp);
        } catch (error) {
            console.error('Error al parsear el usuario:', error);
            this.isLoading = false;
        }
    }

    getAuthorizations(codigo: string): void {
        this.statsService.getAuthorizations(codigo).subscribe({
            next: (data) => {
                this.autorizaciones = data.Table || [];
                this.aplicarFiltros();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al obtener las autorizaciones:', err);
                this.autorizaciones = [];
                this.autorizacionesFiltradas = [];
                this.isLoading = false;
            }
        });
    }

    aplicarFiltros(): void {
        let resultados = [...this.autorizaciones];

        // Filtro global
        if (this.filtroGlobal.trim()) {
            const busqueda = this.filtroGlobal.toLowerCase();
            resultados = resultados.filter((auth) => Object.values(auth).some((val) => val?.toString().toLowerCase().includes(busqueda)));
        }

        // Filtros por columna
        Object.keys(this.filtros).forEach((key) => {
            const valor = this.filtros[key];
            if (valor.trim()) {
                const busqueda = valor.toLowerCase();
                resultados = resultados.filter((auth) => auth[key as keyof Autorizacion]?.toString().toLowerCase().includes(busqueda));
            }
        });

        this.autorizacionesFiltradas = resultados;
        this.totalPaginas = Math.ceil(this.autorizacionesFiltradas.length / this.itemsPorPagina);
        this.paginaActual = 1;
    }

    limpiarFiltros(): void {
        this.filtroGlobal = '';
        this.filtros = {
            AUTORIZACION: '',
            FEC_APE: '',
            FEC_SER: '',
            TIPOPSS: '',
            PSS: '',
            DESCRIPCION: '',
            MONTO_AUTORIZADO: ''
        };
        this.aplicarFiltros();
    }

    ordenarPor(columna: keyof Autorizacion): void {
        if (this.columnaOrden === columna) {
            this.ordenAscendente = !this.ordenAscendente;
        } else {
            this.columnaOrden = columna;
            this.ordenAscendente = true;
        }

        this.autorizacionesFiltradas.sort((a, b) => {
            const valorA = a[columna]?.toString() || '';
            const valorB = b[columna]?.toString() || '';

            let comparacion = 0;
            if (valorA < valorB) comparacion = -1;
            if (valorA > valorB) comparacion = 1;

            return this.ordenAscendente ? comparacion : -comparacion;
        });
    }

    get autorizacionesPaginadas(): Autorizacion[] {
        const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
        const fin = inicio + this.itemsPorPagina;
        return this.autorizacionesFiltradas.slice(inicio, fin);
    }

    cambiarPagina(pagina: number): void {
        if (pagina >= 1 && pagina <= this.totalPaginas) {
            this.paginaActual = pagina;
        }
    }

    cambiarItemsPorPagina(): void {
        this.totalPaginas = Math.ceil(this.autorizacionesFiltradas.length / this.itemsPorPagina);
        this.paginaActual = 1;
    }

    get rangoMostrado(): string {
        if (this.autorizacionesFiltradas.length === 0) return '0 de 0';
        const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
        const fin = Math.min(inicio + this.itemsPorPagina - 1, this.autorizacionesFiltradas.length);
        return `${inicio}-${fin} de ${this.autorizacionesFiltradas.length}`;
    }

    get paginasArray(): number[] {
        const paginas: number[] = [];
        const maxBotones = 5;
        let inicio = Math.max(1, this.paginaActual - Math.floor(maxBotones / 2));
        let fin = Math.min(this.totalPaginas, inicio + maxBotones - 1);

        if (fin - inicio + 1 < maxBotones) {
            inicio = Math.max(1, fin - maxBotones + 1);
        }

        for (let i = inicio; i <= fin; i++) {
            paginas.push(i);
        }

        return paginas;
    }

    exportarPDF(): void {
        const doc = new jsPDF('l', 'mm', 'a4'); // Landscape para más espacio

        // Colores corporativos (tuplas de 3 elementos)
        const primaryColor: [number, number, number] = [38, 78, 114]; // #264e72
        const accentColor: [number, number, number] = [0, 174, 240]; // #00aef0
        const orangeColor: [number, number, number] = [248, 148, 32]; // #f89420

        // Header del documento
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 297, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Autorizaciones', 15, 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const fecha = new Date().toLocaleDateString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Generado: ${fecha}`, 15, 25);
        doc.text(`Total de registros: ${this.autorizacionesFiltradas.length}`, 15, 30);

        // Preparar datos para la tabla
        const tableData = this.autorizacionesFiltradas.map((auth) => [auth.AUTORIZACION, auth.FEC_APE, auth.FEC_SER, auth.TIPOPSS, auth.PSS, auth.DESCRIPCION, `RD$ ${auth.MONTO_AUTORIZADO}`]);

        // Generar tabla con autoTable
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
            bodyStyles: {
                fontSize: 8,
                textColor: [45, 55, 72]
            },
            alternateRowStyles: {
                fillColor: [247, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 25, halign: 'center' },
                3: { cellWidth: 20, halign: 'center' },
                4: { cellWidth: 45 },
                5: { cellWidth: 85 },
                6: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: orangeColor }
            },
            margin: { left: 15, right: 15 },
            didDrawPage: (data) => {
                // Footer en cada página
                const pageCount = doc.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text(`Página ${data.pageNumber} de ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
            }
        });

        // Guardar el PDF
        const fechaArchivo = new Date().toISOString().split('T')[0];
        doc.save(`autorizaciones_${fechaArchivo}.pdf`);
    }
}
