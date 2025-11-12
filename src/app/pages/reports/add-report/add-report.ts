import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface ErrorReport {
    tipo: string;
    modulo: string;
    descripcion: string;
    pasos: string;
    prioridad: string;
    adjunto?: File;
}

interface UserDetails {
    Codigo: string;
    Nombre: string;
    Email?: string;
}

@Component({
    selector: 'app-add-report',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './add-report.html',
    styleUrls: ['./add-report.scss']
})
export class AddReport implements OnInit {
    userDetails: UserDetails | null = null;
    isSubmitting: boolean = false;
    showSuccessMessage: boolean = false;
    showErrorMessage: boolean = false;
    errorMessage: string = '';

    // Credenciales de Mailjet
    private readonly MAILJET_API_KEY = '7e2f0ebdcfc6b2136ee23364269e88b4';
    private readonly MAILJET_SECRET_KEY = 'b9caee886d0ab71ff9b2599cca959510';

    report: ErrorReport = {
        tipo: '',
        modulo: '',
        descripcion: '',
        pasos: '',
        prioridad: 'media'
    };

    tiposError = [
        { value: 'funcional', label: 'Error Funcional' },
        { value: 'visual', label: 'Error Visual' },
        { value: 'rendimiento', label: 'Problema de Rendimiento' },
        { value: 'datos', label: 'Error en Datos' },
        { value: 'acceso', label: 'Problema de Acceso' },
        { value: 'otro', label: 'Otro' }
    ];

    modulos = [
        { value: 'dashboard', label: 'Dashboard' },
        { value: 'autorizaciones', label: 'Autorizaciones' },
        { value: 'reembolsos', label: 'Reembolsos' },
        { value: 'carnets', label: 'Carnés Digitales' },
        { value: 'perfil', label: 'Perfil de Usuario' },
        { value: 'reportes', label: 'Reportes' },
        { value: 'otro', label: 'Otro' }
    ];

    prioridades = [
        { value: 'baja', label: 'Baja', color: '#10b981' },
        { value: 'media', label: 'Media', color: '#f59e0b' },
        { value: 'alta', label: 'Alta', color: '#ef4444' }
    ];

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
        const storedValue = localStorage.getItem('user');
        if (storedValue) {
            try {
                const user = JSON.parse(storedValue);
                this.userDetails = user.details;
            } catch (error) {
                console.error('Error al parsear el usuario:', error);
            }
        }
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Validar tamaño (máximo 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.errorMessage = 'El archivo no debe superar los 5MB';
                this.showErrorMessage = true;
                setTimeout(() => (this.showErrorMessage = false), 5000);
                return;
            }

            // Validar tipo de archivo
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                this.errorMessage = 'Solo se permiten imágenes (JPG, PNG, GIF) o archivos PDF';
                this.showErrorMessage = true;
                setTimeout(() => (this.showErrorMessage = false), 5000);
                return;
            }

            this.report.adjunto = file;
        }
    }

    removeFile(): void {
        this.report.adjunto = undefined;
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.value = '';
        }
    }

    openFileInput(): void {
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    isFormValid(): boolean {
        return !!(this.report.tipo && this.report.modulo && this.report.descripcion.trim() && this.report.prioridad);
    }

    async submitReport(): Promise<void> {
        if (!this.isFormValid() || this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;
        this.showErrorMessage = false;

        try {
            const fecha = new Date().toLocaleString('es-DO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            const tipoLabel = this.tiposError.find((t) => t.value === this.report.tipo)?.label || this.report.tipo;
            const moduloLabel = this.modulos.find((m) => m.value === this.report.modulo)?.label || this.report.modulo;
            const prioridadLabel = this.prioridades.find((p) => p.value === this.report.prioridad)?.label || this.report.prioridad;

            const htmlMessage = `
                <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background: linear-gradient(135deg, #264e72 0%, #1a3952 100%); padding: 30px; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 28px;">Reporte de Error</h1>
                        <p style="color: #00aef0; margin: 10px 0 0 0; font-size: 16px;">Oficina Virtual - ARS RESERVAS</p>
                    </div>
                    
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <p style="color: #666; font-size: 14px; margin-bottom: 25px;">
                            Se ha recibido un nuevo reporte de error desde la Oficina Virtual. A continuación se detallan los datos del error reportado por el afiliado <strong>${this.userDetails?.Nombre || 'No disponible'}</strong> (Código: ${this.userDetails?.Codigo || 'N/A'}) el día ${fecha}.
                        </p>

                        <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #264e72; margin-bottom: 20px;">
                            <h3 style="color: #264e72; margin-top: 0;">📋 Información del Error</h3>
                            <p style="margin: 10px 0;"><strong>Tipo de Error:</strong> ${tipoLabel}</p>
                            <p style="margin: 10px 0;"><strong>Módulo Afectado:</strong> ${moduloLabel}</p>
                            <p style="margin: 10px 0;"><strong>Prioridad:</strong> <span style="color: ${this.getPriorityColor(this.report.prioridad)}; font-weight: bold;">${prioridadLabel.toUpperCase()}</span></p>
                        </div>

                        <div style="background: #fff3cd; padding: 20px; border-left: 4px solid #f89420; margin-bottom: 20px;">
                            <h3 style="color: #856404; margin-top: 0;">📝 Descripción del Problema</h3>
                            <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${this.report.descripcion}</p>
                        </div>

                        ${
                            this.report.pasos
                                ? `
                        <div style="background: #e7f3ff; padding: 20px; border-left: 4px solid #00aef0; margin-bottom: 20px;">
                            <h3 style="color: #004085; margin-top: 0;">🔄 Pasos para Reproducir</h3>
                            <p style="color: #333; line-height: 1.6; white-space: pre-wrap;">${this.report.pasos}</p>
                        </div>
                        `
                                : ''
                        }

                        <div style="background: #f8f9fa; padding: 20px; border-left: 4px solid #6c757d; margin-bottom: 20px;">
                            <h3 style="color: #495057; margin-top: 0;">👤 Datos del Afiliado</h3>
                            <p style="margin: 10px 0;"><strong>Nombre Completo:</strong> ${this.userDetails?.Nombre || 'No disponible'}</p>
                            <p style="margin: 10px 0;"><strong>Código de Empleado:</strong> ${this.userDetails?.Codigo || 'No disponible'}</p>
                            <p style="margin: 10px 0;"><strong>Email:</strong> ${this.userDetails?.Email || 'No disponible'}</p>
                        </div>

                        <div style="background: #e9ecef; padding: 20px; border-radius: 5px;">
                            <h3 style="color: #495057; margin-top: 0; font-size: 16px;">💻 Información Técnica</h3>
                            <p style="margin: 8px 0; font-size: 13px; color: #666;"><strong>Navegador:</strong> ${navigator.userAgent}</p>
                            <p style="margin: 8px 0; font-size: 13px; color: #666;"><strong>URL:</strong> ${window.location.href}</p>
                            <p style="margin: 8px 0; font-size: 13px; color: #666;"><strong>Fecha y Hora:</strong> ${fecha}</p>
                            ${this.report.adjunto ? `<p style="margin: 8px 0; font-size: 13px; color: #666;"><strong>Archivo Adjunto:</strong> ${this.report.adjunto.name} (${(this.report.adjunto.size / 1024 / 1024).toFixed(2)} MB)</p>` : ''}
                        </div>

                        <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e9ecef; text-align: center;">
                            <p style="color: #666; font-size: 12px; margin: 0;">
                                Este reporte fue generado automáticamente desde la <strong>Oficina Virtual de ARS RESERVAS</strong>
                            </p>
                        </div>
                    </div>
                </div>
            `;

            let attachments = [];
            if (this.report.adjunto) {
                const base64File = await this.fileToBase64(this.report.adjunto);
                attachments.push({
                    ContentType: this.report.adjunto.type,
                    Filename: this.report.adjunto.name,
                    Base64Content: base64File
                });
            }

            const mailjetPayload = {
                Messages: [
                    {
                        From: {
                            Email: 'eotano@ars.com',
                            Name: 'Oficina Virtual - Reportes de Errores'
                        },
                        To: [
                            {
                                Email: 'eotano@ars.com',
                                Name: 'Soporte Técnico'
                            }
                        ],
                        Cc: [
                            {
                                Email: 'eotano@ars.com',
                                Name: 'Copia 1'
                            }
                        ],
                        Subject: `Reporte de Error - ${moduloLabel} (${prioridadLabel})`,
                        TextPart: this.report.descripcion,
                        HTMLPart: htmlMessage,
                        Attachments: attachments
                    }
                ]
            };

            const credentials = btoa(`${this.MAILJET_API_KEY}:${this.MAILJET_SECRET_KEY}`);
            const headers = new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Basic ${credentials}`
            });

            this.http.post('/mailjet/v3.1/send', mailjetPayload, { headers }).subscribe({
                next: (response: any) => {
                    console.log('Email enviado exitosamente:', response);
                    this.showSuccessMessage = true;
                    this.resetForm();
                    this.isSubmitting = false;

                    // setTimeout(() => {
                    //     this.showSuccessMessage = false;
                    // }, 5000);
                },
                error: (error) => {
                    console.error('Error al enviar el email:', error);
                    console.error('Detalles del error:', error.error);

                    if (error.status === 401) {
                        this.errorMessage = 'Error de autenticación. Verifica las credenciales de Mailjet.';
                    } else if (error.status === 0) {
                        this.errorMessage = 'Error de CORS. Necesitas configurar un proxy o usar un backend.';
                    } else {
                        this.errorMessage = error.error?.ErrorMessage || 'No se pudo enviar el reporte. Por favor, intenta nuevamente.';
                    }

                    this.showErrorMessage = true;
                    this.isSubmitting = false;

                    setTimeout(() => {
                        this.showErrorMessage = false;
                    }, 5000);
                }
            });
        } catch (error) {
            console.error('Error al procesar el reporte:', error);
            this.errorMessage = 'Ocurrió un error al procesar el reporte.';
            this.showErrorMessage = true;
            this.isSubmitting = false;

            setTimeout(() => {
                this.showErrorMessage = false;
            }, 5000);
        }
    }

    private fileToBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64String = (reader.result as string).split(',')[1];
                resolve(base64String);
            };
            reader.onerror = (error) => reject(error);
        });
    }

    resetForm(): void {
        this.report = {
            tipo: '',
            modulo: '',
            descripcion: '',
            pasos: '',
            prioridad: 'media'
        };
        this.removeFile();
    }

    getCharacterCount(): number {
        return this.report.descripcion.length;
    }

    getPriorityColor(prioridad: string): string {
        return this.prioridades.find((p) => p.value === prioridad)?.color || '#6b7280';
    }
}
