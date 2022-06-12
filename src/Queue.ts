// I suppose LinkedList much better for this task
export class Queue<T> {
  private pack: T[] = [];
  constructor() {}
  public get length(): number {
    return this.pack.length;
  }

  public get last(): T {
    return this.pack[this.pack.length - 1];
  }

  public push(element: T): void {
    this.pack.push(element);
  }
  public pop(): T | undefined {
    return this.pack.shift();
  }
}
