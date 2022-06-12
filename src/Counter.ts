export class Counter {
  public value: number = 0;
  constructor(private step: number) {}

  public move(): void {
    this.value += this.step;
  }
}
