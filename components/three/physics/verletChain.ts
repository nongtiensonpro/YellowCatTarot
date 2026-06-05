import * as THREE from 'three';

export interface VerletPoint {
  position: THREE.Vector3;
  prevPosition: THREE.Vector3;
}

export interface VerletConstraint {
  p1: VerletPoint;
  p2: VerletPoint;
  length: number;
}

export class VerletChain {
  points: VerletPoint[] = [];
  constraints: VerletConstraint[] = [];
  gravity: THREE.Vector3 = new THREE.Vector3(0, -9.8, 0);
  damping: number = 0.96; // Damping factor to slowly bring tail to rest

  constructor(pointsCount: number, segmentLength: number, startPosition: THREE.Vector3) {
    // Khởi tạo các điểm
    for (let i = 0; i < pointsCount; i++) {
      const pos = startPosition.clone().add(new THREE.Vector3(0, i * segmentLength, 0));
      this.points.push({
        position: pos,
        prevPosition: pos.clone()
      });
    }

    // Khởi tạo các liên kết ràng buộc độ dài
    for (let i = 0; i < pointsCount - 1; i++) {
      this.constraints.push({
        p1: this.points[i],
        p2: this.points[i + 1],
        length: segmentLength
      });
    }
  }

  update(dt: number, anchorPos: THREE.Vector3, gravityY: number = -5.0) {
    this.gravity.y = gravityY;
    
    // Ghim điểm đầu tiên (anchor)
    this.points[0].position.copy(anchorPos);
    this.points[0].prevPosition.copy(anchorPos);

    // Tích phân Verlet (Verlet Integration) cho các điểm còn lại
    for (let i = 1; i < this.points.length; i++) {
      const p = this.points[i];
      const temp = p.position.clone();
      
      const velocity = p.position.clone().sub(p.prevPosition).multiplyScalar(this.damping);
      const gravityForce = this.gravity.clone().multiplyScalar(dt * dt);
      
      p.position.add(velocity).add(gravityForce);
      p.prevPosition.copy(temp);
    }

    // Giải phóng ràng buộc độ dài (Solve Constraints - chạy 4 vòng lặp để tăng độ chính xác)
    for (let iter = 0; iter < 4; iter++) {
      for (const c of this.constraints) {
        const delta = new THREE.Vector3().subVectors(c.p2.position, c.p1.position);
        const currentLength = delta.length();
        if (currentLength === 0) continue;
        const diff = c.length - currentLength;
        const percent = (diff / currentLength) * 0.5;
        const offset = delta.multiplyScalar(percent);
        
        if (c.p1 !== this.points[0]) {
          c.p1.position.sub(offset);
        }
        c.p2.position.add(offset);
      }
    }
  }
}
