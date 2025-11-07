import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'capitalize'
})
export class CapitalizePipe implements PipeTransform {
    transform(value: string | undefined): string {
        if (!value) return '';

        return value
            .toLowerCase()
            .split(' ')
            .map((word) => {
                if (!word) return word;
                return word.charAt(0).toUpperCase() + word.slice(1);
            })
            .join(' ');
    }
}
