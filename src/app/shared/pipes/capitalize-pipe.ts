import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (!value) {
            return '';
        }

        //  Convertir todo a minúsculas
        const lower = value.toLowerCase();

        //  Tomar la primera letra y pasarla a mayúscula
        const firstLetter = lower.charAt(0).toUpperCase();

        //  Tomar el resto de la cadena (desde el segundo carácter)
        const restOfString = lower.slice(1);

        //  Unir la primera letra capitalizada con el resto de la cadena en minúsculas
        return firstLetter + restOfString;
    }
}
