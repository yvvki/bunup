export function add(a: number, b: number): number {
      return a + b;
}

export function subtract(a: number, b: number): number {
      return a - b;
}

export function multiply(a: number, b: number): number {
      return a * b;
}

export function divide(a: number, b: number): number {
      if (b === 0) {
            throw new Error('Division by zero');
      }
      return a / b;
}

export function square(n: number): number {
      return n * n;
}

export function sqrt(n: number): number {
      if (n < 0) {
            throw new Error('Cannot compute square root of negative number');
      }
      return Math.sqrt(n);
}

export class Vector2D {
      constructor(
            public x: number,
            public y: number,
      ) {}

      add(other: Vector2D): Vector2D {
            return new Vector2D(this.x + other.x, this.y + other.y);
      }

      subtract(other: Vector2D): Vector2D {
            return new Vector2D(this.x - other.x, this.y - other.y);
      }

      scale(factor: number): Vector2D {
            return new Vector2D(this.x * factor, this.y * factor);
      }

      dotProduct(other: Vector2D): number {
            return this.x * other.x + this.y * other.y;
      }

      magnitude(): number {
            return Math.sqrt(this.x * this.x + this.y * this.y);
      }

      normalize(): Vector2D {
            const mag = this.magnitude();
            if (mag === 0) {
                  return new Vector2D(0, 0);
            }
            return this.scale(1 / mag);
      }
}
