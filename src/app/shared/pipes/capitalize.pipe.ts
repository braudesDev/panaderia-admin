import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'capitalize',
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return value
      .split(' ')
      .map(
        (word) =>
          word.charAt(0).toLocaleUpperCase('es') +
          word.slice(1).toLocaleLowerCase('es'),
      )
      .join(' ');
  }
}
