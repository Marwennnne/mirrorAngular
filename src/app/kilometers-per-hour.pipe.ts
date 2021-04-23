import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'kilometersPerHour'
})
export class KilometersPerHourPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    //Convertion m/s en km/h
    const speed: number = value * 3.6;
    return speed;
  }

}
