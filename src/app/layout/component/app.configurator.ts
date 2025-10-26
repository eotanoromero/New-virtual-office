import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, computed, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { $t, updatePreset, updateSurfacePalette } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';
import Lara from '@primeuix/themes/lara';
import Nora from '@primeuix/themes/nora';
import { PrimeNG } from 'primeng/config';
import { SelectButtonModule } from 'primeng/selectbutton';
import { LayoutService } from '../service/layout.service';

const presets = {
    Aura,
    Lara,
    Nora
} as const;

declare type KeyOfType<T> = keyof T extends infer U ? U : never;

declare type SurfacesType = {
    name?: string;
    palette?: {
        0?: string;
        50?: string;
        100?: string;
        200?: string;
        300?: string;
        400?: string;
        500?: string;
        600?: string;
        700?: string;
        800?: string;
        900?: string;
        950?: string;
    };
};

// Paleta de colores primarios personalizada con los 6 colores solicitados.
const customPrimaryPalettes: SurfacesType[] = [
    { name: 'Navy', palette: { '500': '#063452' } }, // #063452
    { name: 'Cyan', palette: { '500': '#00aef0' } }, // #00aef0
    { name: 'White', palette: { '500': '#ffffff' } }, // #ffffff
    { name: 'Orange', palette: { '500': '#ff9e1b' } }, // #ff9e1b
    { name: 'DarkGray', palette: { '500': '#63666a' } }, // #63666a
    { name: 'LightGray', palette: { '500': '#a7a8a9' } } // #a7a8a9
];

@Component({
    selector: 'app-configurator',
    standalone: true,
    imports: [CommonModule, FormsModule, SelectButtonModule],
    template: `
        <div class="flex flex-col gap-4">
            <div>
                <span class="text-sm text-muted-color font-semibold">Primary</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-start">
                    @for (primaryColor of primaryColors(); track primaryColor.name) {
                        <button
                            type="button"
                            [title]="primaryColor.name"
                            (click)="updateColors($event, 'primary', primaryColor)"
                            [ngClass]="{
                                'outline outline-primary': primaryColor.name === selectedPrimaryColor()
                            }"
                            class="cursor-pointer w-5 h-5 rounded-full flex shrink-0 items-center justify-center outline-offset-1 shadow"
                            [style]="{
                                'background-color': primaryColor?.palette?.['500']
                            }"
                        ></button>
                    }
                </div>
            </div>
            <div>
                <span class="text-sm text-muted-color font-semibold">Surface</span>
                <div class="pt-2 flex gap-2 flex-wrap justify-start">
                    @for (surface of surfaces; track surface.name) {
                        <button
                            type="button"
                            [title]="surface.name"
                            (click)="updateColors($event, 'surface', surface)"
                            class="cursor-pointer w-5 h-5 rounded-full flex shrink-0 items-center justify-center p-0 outline-offset-1"
                            [ngClass]="{
                                'outline outline-primary': selectedSurfaceColor() ? selectedSurfaceColor() === surface.name : layoutService.layoutConfig().darkTheme ? surface.name === 'zinc' : surface.name === 'slate'
                            }"
                            [style]="{
                                'background-color': surface?.palette?.['500']
                            }"
                        ></button>
                    }
                </div>
            </div>
            <div class="flex flex-col gap-2">
                <span class="text-sm text-muted-color font-semibold">Presets</span>
                <p-selectbutton [options]="presets" [ngModel]="selectedPreset()" (ngModelChange)="onPresetChange($event)" [allowEmpty]="false" size="small" />
            </div>
            <div *ngIf="showMenuModeButton()" class="flex flex-col gap-2">
                <span class="text-sm text-muted-color font-semibold">Menu Mode</span>
                <p-selectbutton [ngModel]="menuMode()" (ngModelChange)="onMenuModeChange($event)" [options]="menuModeOptions" [allowEmpty]="false" size="small" />
            </div>
        </div>
    `,
    host: {
        class: 'hidden absolute top-13 right-0 w-72 p-4 bg-surface-0 dark:bg-surface-900 border border-surface rounded-border origin-top shadow-[0px_3px_5px_rgba(0,0,0,0.02),0px_0px_2px_rgba(0,0,0,0.05),0px_1px_4px_rgba(0,0,0,0.08)]'
    }
})
export class AppConfigurator {
    router = inject(Router);

    config: PrimeNG = inject(PrimeNG);

    layoutService: LayoutService = inject(LayoutService);

    platformId = inject(PLATFORM_ID);

    primeng = inject(PrimeNG);

    presets = Object.keys(presets);

    showMenuModeButton = signal(!this.router.url.includes('auth'));

    menuModeOptions = [
        { label: 'Static', value: 'static' },
        { label: 'Overlay', value: 'overlay' }
    ];

    ngOnInit() {
        if (isPlatformBrowser(this.platformId)) {
            this.onPresetChange(this.layoutService.layoutConfig().preset);
        }
    }

    // Se mantiene la lista completa de superficies que proporcionaste.
    surfaces: SurfacesType[] = [
        {
            name: 'slate',
            palette: {
                0: '#ffffff',
                50: '#f8fafc',
                100: '#f1f5f9',
                200: '#e2e8f0',
                300: '#cbd5e1',
                400: '#94a3b8',
                500: '#64748b',
                600: '#475569',
                700: '#334155',
                800: '#1e293b',
                900: '#0f172a',
                950: '#020617'
            }
        },
        {
            name: 'gray',
            palette: {
                0: '#ffffff',
                50: '#f9fafb',
                100: '#f3f4f6',
                200: '#e5e7eb',
                300: '#d1d5db',
                400: '#9ca3af',
                500: '#6b7280',
                600: '#4b5563',
                700: '#374151',
                800: '#1f2937',
                900: '#111827',
                950: '#030712'
            }
        },
        {
            name: 'zinc',
            palette: {
                0: '#ffffff',
                50: '#fafafa',
                100: '#f4f4f5',
                200: '#e4e4e7',
                300: '#d4d4d8',
                400: '#a1a1aa',
                500: '#71717a',
                600: '#52525b',
                700: '#3f3f46',
                800: '#27272a',
                900: '#18181b',
                950: '#09090b'
            }
        },
        {
            name: 'neutral',
            palette: {
                0: '#ffffff',
                50: '#fafafa',
                100: '#f5f5f5',
                200: '#e5e5e5',
                300: '#d4d4d4',
                400: '#a3a3a3',
                500: '#737373',
                600: '#525252',
                700: '#404040',
                800: '#262626',
                900: '#171717',
                950: '#0a0a0a'
            }
        },
        {
            name: 'stone',
            palette: {
                0: '#ffffff',
                50: '#fafaf9',
                100: '#f5f5f4',
                200: '#e7e5e4',
                300: '#d6d3d1',
                400: '#a8a29e',
                500: '#78716c',
                600: '#57534e',
                700: '#44403c',
                800: '#292524',
                900: '#1c1917',
                950: '#0c0a09'
            }
        },
        {
            name: 'soho',
            palette: {
                0: '#ffffff',
                50: '#ececec',
                100: '#dedfdf',
                200: '#c4c4c6',
                300: '#adaeb0',
                400: '#97979b',
                500: '#7f8084',
                600: '#6a6b70',
                700: '#55565b',
                800: '#3f4046',
                900: '#2c2c34',
                950: '#16161d'
            }
        },
        {
            name: 'viva',
            palette: {
                0: '#ffffff',
                50: '#f3f3f3',
                100: '#e7e7e8',
                200: '#cfd0d0',
                300: '#b7b8b9',
                400: '#9fa1a1',
                500: '#87898a',
                600: '#6e7173',
                700: '#565a5b',
                800: '#3e4244',
                900: '#262b2c',
                950: '#0e1315'
            }
        },
        {
            name: 'ocean',
            palette: {
                0: '#ffffff',
                50: '#fbfcfc',
                100: '#F7F9F8',
                200: '#EFF3F2',
                300: '#DADEDD',
                400: '#B1B7B6',
                500: '#828787',
                600: '#5F7274',
                700: '#415B61',
                800: '#29444E',
                900: '#183240',
                950: '#0c1920'
            }
        }
    ];

    selectedPrimaryColor = computed(() => {
        return this.layoutService.layoutConfig().primary;
    });

    selectedSurfaceColor = computed(() => this.layoutService.layoutConfig().surface);

    selectedPreset = computed(() => this.layoutService.layoutConfig().preset);

    menuMode = computed(() => this.layoutService.layoutConfig().menuMode);

    /**
     * MODIFICADO: Ahora solo devuelve los 6 colores primarios solicitados.
     */
    primaryColors = computed<SurfacesType[]>(() => {
        return customPrimaryPalettes;
    });

    getPresetExt() {
        const color: SurfacesType = this.primaryColors().find((c) => c.name === this.selectedPrimaryColor()) || {};
        const preset = this.layoutService.layoutConfig().preset;

        // Identifica los colores que son neutrales (White, LightGray) o muy oscuros (Navy, DarkGray)
        const isNeutralOrDark = color.name === 'White' || color.name === 'Navy' || color.name === 'DarkGray' || color.name === 'LightGray';

        if (isNeutralOrDark) {
            // Lógica para colores neutrales/oscuros (usan la paleta de superficie como base)
            return {
                semantic: {
                    primary: {
                        50: '{surface.50}',
                        100: '{surface.100}',
                        200: '{surface.200}',
                        300: '{surface.300}',
                        400: '{surface.400}',
                        // Usa el color primario personalizado para el swatch y el color principal
                        500: color.palette?.['500'] || '{surface.500}',
                        600: '{surface.600}',
                        700: '{surface.700}',
                        800: '{surface.800}',
                        900: '{surface.900}',
                        950: '{surface.950}'
                    },
                    colorScheme: {
                        light: {
                            primary: {
                                // Texto oscuro para White/LightGray, texto claro para Navy/DarkGray
                                color: color.name === 'White' || color.name === 'LightGray' ? '{primary.950}' : '#ffffff',
                                contrastColor: '#ffffff',
                                hoverColor: color.name === 'White' || color.name === 'LightGray' ? '{primary.800}' : '{primary.50}',
                                activeColor: color.name === 'White' || color.name === 'LightGray' ? '{primary.700}' : '{primary.100}'
                            },
                            highlight: {
                                background: color.name === 'White' || color.name === 'LightGray' ? '{primary.950}' : color.palette?.['500'] || '{primary.500}',
                                focusBackground: color.name === 'White' || color.name === 'LightGray' ? '{primary.700}' : color.palette?.['500'] || '{primary.700}',
                                color: '#ffffff',
                                focusColor: '#ffffff'
                            }
                        },
                        dark: {
                            primary: {
                                // Texto oscuro para White/LightGray, texto claro para Navy/DarkGray
                                color: color.name === 'White' || color.name === 'LightGray' ? '{primary.950}' : '{primary.50}',
                                contrastColor: '{primary.950}',
                                hoverColor: color.name === 'White' || color.name === 'LightGray' ? '{primary.200}' : '{primary.200}',
                                activeColor: color.name === 'White' || color.name === 'LightGray' ? '{primary.300}' : '{primary.300}'
                            },
                            highlight: {
                                background: color.name === 'White' || color.name === 'LightGray' ? '{primary.50}' : color.palette?.['500'] || '{primary.500}',
                                focusBackground: color.name === 'White' || color.name === 'LightGray' ? '{primary.300}' : color.palette?.['500'] || '{primary.300}',
                                color: color.name === 'White' || color.name === 'LightGray' ? '{primary.950}' : '{primary.950}',
                                focusColor: color.name === 'White' || color.name === 'LightGray' ? '{primary.950}' : '{primary.950}'
                            }
                        }
                    }
                }
            };
        } else {
            // Lógica estándar para colores brillantes (Cyan y Orange)
            const basePalette: Record<string, string> = {};
            if (color.palette?.['500']) {
                basePalette['500'] = color.palette['500']!;
            }

            if (preset === 'Nora') {
                return {
                    semantic: {
                        primary: basePalette,
                        colorScheme: {
                            light: {
                                primary: {
                                    color: color.palette?.['500'] || '#000000',
                                    contrastColor: '#ffffff',
                                    hoverColor: color.palette?.['500'] || '#000000',
                                    activeColor: color.palette?.['500'] || '#000000'
                                },
                                highlight: {
                                    background: color.palette?.['500'] || '#000000',
                                    focusBackground: color.palette?.['500'] || '#000000',
                                    color: '#ffffff',
                                    focusColor: '#ffffff'
                                }
                            },
                            dark: {
                                primary: {
                                    color: color.palette?.['500'] || '#FFFFFF',
                                    contrastColor: '{surface.900}',
                                    hoverColor: color.palette?.['500'] || '#FFFFFF',
                                    activeColor: color.palette?.['500'] || '#FFFFFF'
                                },
                                highlight: {
                                    background: color.palette?.['500'] || '#FFFFFF',
                                    focusBackground: color.palette?.['500'] || '#FFFFFF',
                                    color: '{surface.900}',
                                    focusColor: '{surface.900}'
                                }
                            }
                        }
                    }
                };
            } else {
                return {
                    semantic: {
                        primary: basePalette,
                        colorScheme: {
                            light: {
                                primary: {
                                    color: color.palette?.['500'] || '#000000',
                                    contrastColor: '#ffffff',
                                    hoverColor: color.palette?.['500'] || '#000000',
                                    activeColor: color.palette?.['500'] || '#000000'
                                },
                                highlight: {
                                    background: 'color-mix(in srgb, ' + (color.palette?.['500'] || '#000000') + ', transparent 90%)',
                                    focusBackground: 'color-mix(in srgb, ' + (color.palette?.['500'] || '#000000') + ', transparent 80%)',
                                    color: color.palette?.['500'] || '#000000',
                                    focusColor: color.palette?.['500'] || '#000000'
                                }
                            },
                            dark: {
                                primary: {
                                    color: color.palette?.['500'] || '#FFFFFF',
                                    contrastColor: '{surface.900}',
                                    hoverColor: color.palette?.['500'] || '#FFFFFF',
                                    activeColor: color.palette?.['500'] || '#FFFFFF'
                                },
                                highlight: {
                                    background: 'color-mix(in srgb, ' + (color.palette?.['500'] || '#FFFFFF') + ', transparent 84%)',
                                    focusBackground: 'color-mix(in srgb, ' + (color.palette?.['500'] || '#FFFFFF') + ', transparent 76%)',
                                    color: 'rgba(255,255,255,.87)',
                                    focusColor: 'rgba(255,255,255,.87)'
                                }
                            }
                        }
                    }
                };
            }
        }
    }

    updateColors(event: any, type: string, color: any) {
        if (type === 'primary') {
            this.layoutService.layoutConfig.update((state) => ({ ...state, primary: color.name }));
        } else if (type === 'surface') {
            this.layoutService.layoutConfig.update((state) => ({ ...state, surface: color.name }));
        }
        this.applyTheme(type, color);

        event.stopPropagation();
    }

    applyTheme(type: string, color: any) {
        if (type === 'primary') {
            updatePreset(this.getPresetExt());
        } else if (type === 'surface') {
            updateSurfacePalette(color.palette);
        }
    }

    onPresetChange(event: any) {
        this.layoutService.layoutConfig.update((state) => ({ ...state, preset: event }));
        const preset = presets[event as KeyOfType<typeof presets>];
        const surfacePalette = this.surfaces.find((s) => s.name === this.selectedSurfaceColor())?.palette;
        $t().preset(preset).preset(this.getPresetExt()).surfacePalette(surfacePalette).use({ useDefaultOptions: true });
    }

    onMenuModeChange(event: string) {
        this.layoutService.layoutConfig.update((prev) => ({ ...prev, menuMode: event }));
    }
}
