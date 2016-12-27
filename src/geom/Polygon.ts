/**
 * Created by Samuel Gratzl on 27.12.2016.
 */
import {IIntersectionParam, Vector2D} from '../2D';
import AShape from './AShape';
import Circle from './Circle';
import Rect from './Rect';

export default class Polygon extends AShape {
  constructor(private points: Vector2D[] = []) {
    super();
  }

  push(x: number, y: number);
  push(...points: Vector2D[]);
  push() {
    if (arguments.length === 2 && typeof arguments[0] === 'number') {
      this.points.push(new Vector2D(arguments[0], arguments[1]));
    } else {
      this.points.push(...Array.from(arguments));
    }
  }

  toString() {
    return `Polygon(${this.points.join(',')})`;
  }

  shiftImpl(x, y) {
    this.points.forEach((p) => {
      p.x += x;
      p.y += y;
    });
  }

  get length() {
    return this.points.length;
  }

  aabb(): Rect {
    let min_x = Number.POSITIVE_INFINITY, min_y = Number.POSITIVE_INFINITY, max_x = Number.NEGATIVE_INFINITY, max_y = Number.NEGATIVE_INFINITY;
    this.points.forEach((p) => {
      if (p.x < min_x) {
        min_x = p.x;
      }
      if (p.y < min_y) {
        min_y = p.y;
      }
      if (p.x > max_x) {
        max_x = p.x;
      }
      if (p.y > max_y) {
        max_y = p.y;
      }
    });
    return new Rect(min_x, min_y, max_x - min_x, max_y - min_y);
  }

  bs(): Circle {
    let mean_x = 0, mean_y = 0;
    this.points.forEach((p) => {
      mean_x += p.x;
      mean_y += p.y;
    });
    mean_x /= this.length;
    mean_y /= this.length;
    //TODO better polygon center
    let radius = 0;
    this.points.forEach((p) => {
      let dx = p.x - mean_x;
      let dy = p.y - mean_y;
      let d = dx * dx + dy * dy;
      if (d > radius) {
        radius = d;
      }
    });
    return new Circle(mean_x, mean_y, Math.sqrt(radius));
  }

  transform(scale: number[], rotate: number) {
    //TODO rotate
    return new Polygon(this.points.map((p) => new Vector2D(p.x * scale[0], p.y * scale[1])));
  }

  pointInPolygon(point: Vector2D) {
    const length = this.points.length;
    let counter = 0;
    let x_inter;
    let p1 = this.points[0];
    for (let i = 1; i <= length; i++) {
      let p2 = this.points[i % length];
      if (point.y > Math.min(p1.y, p2.y) && point.y <= Math.max(p1.y, p2.y) && point.x <= Math.max(p1.x, p2.x) && p1.y !== p2.y) {
        x_inter = (point.y - p1.y) * (p2.x - p1.x) / (p2.y - p1.y) + p1.x;
        if (p1.x === p2.x || point.x <= x_inter) {
          counter++;
        }
      }
      p1 = p2;
    }
    return (counter % 2 === 1);
  }

  get area() {
    let area = 0;
    const length = this.points.length;
    for (let i = 0; i < length; i++) {
      const h1 = this.points[i];
      const h2 = this.points[(i + 1) % length];
      area += (h1.x * h2.y - h2.x * h1.y);
    }
    return area / 2;
  }

  get centroid() {
    const length = this.points.length;
    const area6x = 6 * this.area;
    let x_sum = 0;
    let y_sum = 0;
    for (let i = 0; i < length; i++) {
      const p1 = this.points[i];
      const p2 = this.points[(i + 1) % length];
      const cross = (p1.x * p2.y - p2.x * p1.y);
      x_sum += (p1.x + p2.x) * cross;
      y_sum += (p1.y + p2.y) * cross;
    }
    return new Vector2D(x_sum / area6x, y_sum / area6x);
  }

  get isClockwise() {
    return this.area < 0;
  }

  get isCounterClockwise() {
    return this.area > 0;
  }

  get isConcave() {
    let positive = 0;
    let negative = 0;
    const length = this.points.length;
    for (let i = 0; i < length; i++) {
      const p0 = this.points[i];
      const p1 = this.points[(i + 1) % length];
      const p2 = this.points[(i + 2) % length];
      const v0 = Vector2D.fromPoints(p0, p1);
      const v1 = Vector2D.fromPoints(p1, p2);
      const cross = v0.cross(v1);
      if (cross < 0) {
        negative++;
      } else {
        positive++;
      }
    }
    return (negative !== 0 && positive !== 0);
  }

  get isConvex() {
    return !this.isConcave;
  }

  asIntersectionParams(): IIntersectionParam {
    return {
      name: 'Polygon',
      params: [this.points.slice()]
    };
  }
}
