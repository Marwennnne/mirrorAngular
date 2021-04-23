import { Coord } from './coord';

export class City {
  public id: number;
  public name: string;
  public country: string;
  public coord: Coord;

  constructor() {
    this.coord = new Coord();
  }
}
