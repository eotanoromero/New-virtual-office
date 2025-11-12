import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StatsService } from '../dashboard/components/statswidget/services/stats.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Reembolso {
    DESCRIPCION: string;
    ESTATUS: string;
    FEC_SER: string;
    MON_PAG: string;
    SECUENCIAL: string;
    TIP_A_USO: string;
}

@Component({
    selector: 'app-refund',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './refund.html',
    styleUrl: './refund.scss'
})
export class Refund {
    reembolsos: Reembolso[] = [];
    reembolsosFiltrados: Reembolso[] = [];
    isLoading: boolean = true;

    // Filtros
    filtroGlobal: string = '';
    filtros: any = {
        DESCRIPCION: '',
        ESTATUS: '',
        FEC_SER: '',
        MON_PAG: '',
        SECUENCIAL: '',
        TIP_A_USO: ''
    };

    // Paginación
    paginaActual: number = 1;
    itemsPorPagina: number = 10;
    totalPaginas: number = 0;
    opcionesPaginas: number[] = [5, 10, 20, 50, 100];

    // Ordenamiento
    columnaOrden: keyof Reembolso | '' = '';
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
            this.getRefunds(code_emp);
        } catch (error) {
            console.error('Error al parsear el usuario:', error);
            this.isLoading = false;
        }
    }

    getRefunds(codigo: string): void {
        this.statsService.getRefunds(codigo).subscribe({
            next: (data) => {
                // Asumiendo que la data viene en data.Table o similar
                this.reembolsos = data.Table || data || [];
                this.aplicarFiltros();
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error al obtener los reembolsos:', err);
                this.reembolsos = [];
                this.reembolsosFiltrados = [];
                this.isLoading = false;
            }
        });
    }

    aplicarFiltros(): void {
        let resultados = [...this.reembolsos];

        // Filtro global
        if (this.filtroGlobal.trim()) {
            const busqueda = this.filtroGlobal.toLowerCase();
            resultados = resultados.filter((reembolso) => Object.values(reembolso).some((val) => val?.toString().toLowerCase().includes(busqueda)));
        }

        // Filtros por columna
        Object.keys(this.filtros).forEach((key) => {
            const valor = this.filtros[key];
            if (valor.trim()) {
                const busqueda = valor.toLowerCase();
                resultados = resultados.filter((reembolso) => reembolso[key as keyof Reembolso]?.toString().toLowerCase().includes(busqueda));
            }
        });

        this.reembolsosFiltrados = resultados;
        this.totalPaginas = Math.ceil(this.reembolsosFiltrados.length / this.itemsPorPagina);
        this.paginaActual = 1;
    }

    limpiarFiltros(): void {
        this.filtroGlobal = '';
        this.filtros = {
            DESCRIPCION: '',
            ESTATUS: '',
            FEC_SER: '',
            MON_PAG: '',
            SECUENCIAL: '',
            TIP_A_USO: ''
        };
        this.aplicarFiltros();
    }

    ordenarPor(columna: keyof Reembolso): void {
        if (this.columnaOrden === columna) {
            this.ordenAscendente = !this.ordenAscendente;
        } else {
            this.columnaOrden = columna;
            this.ordenAscendente = true;
        }

        this.reembolsosFiltrados.sort((a, b) => {
            const valorA = a[columna]?.toString() || '';
            const valorB = b[columna]?.toString() || '';

            let comparacion = 0;
            if (valorA < valorB) comparacion = -1;
            if (valorA > valorB) comparacion = 1;

            return this.ordenAscendente ? comparacion : -comparacion;
        });
    }

    get reembolsosPaginados(): Reembolso[] {
        const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
        const fin = inicio + this.itemsPorPagina;
        return this.reembolsosFiltrados.slice(inicio, fin);
    }

    cambiarPagina(pagina: number): void {
        if (pagina >= 1 && pagina <= this.totalPaginas) {
            this.paginaActual = pagina;
        }
    }

    cambiarItemsPorPagina(): void {
        this.totalPaginas = Math.ceil(this.reembolsosFiltrados.length / this.itemsPorPagina);
        this.paginaActual = 1;
    }

    get rangoMostrado(): string {
        if (this.reembolsosFiltrados.length === 0) return '0 de 0';
        const inicio = (this.paginaActual - 1) * this.itemsPorPagina + 1;
        const fin = Math.min(inicio + this.itemsPorPagina - 1, this.reembolsosFiltrados.length);
        return `${inicio}-${fin} de ${this.reembolsosFiltrados.length}`;
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

    getEstatusClass(estatus: string): string {
        const estatusLower = estatus?.toLowerCase() || '';
        if (estatusLower.includes('aprobado') || estatusLower.includes('pagado')) {
            return 'approved';
        } else if (estatusLower.includes('pendiente')) {
            return 'pending';
        } else if (estatusLower.includes('rechazado') || estatusLower.includes('cancelado')) {
            return 'rejected';
        }
        return 'default';
    }

    calcularTotalMonto(): number {
        return this.reembolsosFiltrados.reduce((total, reembolso) => {
            const monto = parseFloat(reembolso.MON_PAG?.replace(/,/g, '') || '0');
            return total + monto;
        }, 0);
    }

    exportarPDF(): void {
        const doc = new jsPDF('l', 'mm', 'a4');

        // Colores corporativos (tuplas de 3 elementos)
        const primaryColor: [number, number, number] = [38, 78, 114];
        const accentColor: [number, number, number] = [0, 174, 240];
        const orangeColor: [number, number, number] = [248, 148, 32];

        // Header del documento
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
        doc.rect(0, 0, 297, 35, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.setFont('helvetica', 'bold');
        doc.text('Reporte de Reembolsos', 15, 15);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const fecha = new Date().toLocaleDateString('es-DO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        doc.text(`Generado: ${fecha}`, 15, 25);
        doc.text(`Total de registros: ${this.reembolsosFiltrados.length}`, 15, 30);

        const totalMonto = this.calcularTotalMonto();
        doc.text(`Monto total: RD$ ${totalMonto.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 180, 30);

        // Preparar datos para la tabla
        const tableData = this.reembolsosFiltrados.map((reembolso) => [reembolso.SECUENCIAL, reembolso.FEC_SER, reembolso.TIP_A_USO, reembolso.DESCRIPCION, reembolso.ESTATUS, `RD$ ${reembolso.MON_PAG}`]);

        // Generar tabla con autoTable
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
            bodyStyles: {
                fontSize: 8,
                textColor: [45, 55, 72]
            },
            alternateRowStyles: {
                fillColor: [247, 250, 252]
            },
            columnStyles: {
                0: { cellWidth: 30, halign: 'center', fontStyle: 'bold' },
                1: { cellWidth: 25, halign: 'center' },
                2: { cellWidth: 30, halign: 'center' },
                3: { cellWidth: 95 },
                4: { cellWidth: 30, halign: 'center' },
                5: { cellWidth: 32, halign: 'right', fontStyle: 'bold', textColor: orangeColor }
            },
            margin: { left: 15, right: 15 },
            didDrawPage: (data) => {
                const pageCount = doc.getNumberOfPages();
                doc.setFontSize(8);
                doc.setTextColor(128, 128, 128);
                doc.text(`Página ${data.pageNumber} de ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 10, { align: 'center' });
            }
        });

        const fechaArchivo = new Date().toISOString().split('T')[0];
        doc.save(`reembolsos_${fechaArchivo}.pdf`);
    }

    exportarCSV(): void {
        const BOM = '\uFEFF';
        const headers = ['Secuencial', 'Fecha Servicio', 'Tipo', 'Descripción', 'Estatus', 'Monto'];

        const escaparValor = (valor: string): string => {
            if (!valor) return '';
            const valorStr = valor.toString();
            if (valorStr.includes(',') || valorStr.includes('"') || valorStr.includes('\n') || valorStr.includes('\r')) {
                return '"' + valorStr.replace(/"/g, '""') + '"';
            }
            return valorStr;
        };

        const rows = this.reembolsosFiltrados.map((reembolso) => [
            escaparValor(reembolso.SECUENCIAL),
            escaparValor(reembolso.FEC_SER),
            escaparValor(reembolso.TIP_A_USO),
            escaparValor(reembolso.DESCRIPCION),
            escaparValor(reembolso.ESTATUS),
            escaparValor(reembolso.MON_PAG)
        ]);

        const csv = BOM + [headers, ...rows].map((row) => row.join(',')).join('\r\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        const fecha = new Date().toISOString().split('T')[0];
        link.setAttribute('href', url);
        link.setAttribute('download', `reembolsos_${fecha}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}
