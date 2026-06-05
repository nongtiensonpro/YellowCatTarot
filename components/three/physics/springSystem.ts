export class Spring {
  current: number;
  target: number;
  velocity: number = 0;
  stiffness: number;
  damping: number;

  constructor(start: number, stiffness: number = 120, damping: number = 12) {
    this.current = start;
    this.target = start;
    this.stiffness = stiffness;
    this.damping = damping;
  }

  update(dt: number) {
    const force = (this.target - this.current) * this.stiffness;
    const dampingForce = -this.velocity * this.damping;
    const acceleration = force + dampingForce;
    
    this.velocity += acceleration * dt;
    this.current += this.velocity * dt;
  }
}

export class SpringVector3 {
  current = { x: 0, y: 0, z: 0 };
  target = { x: 0, y: 0, z: 0 };
  velocity = { x: 0, y: 0, z: 0 };
  stiffness: number;
  damping: number;

  constructor(startX: number, startY: number, startZ: number, stiffness: number = 120, damping: number = 12) {
    this.current = { x: startX, y: startY, z: startZ };
    this.target = { x: startX, y: startY, z: startZ };
    this.stiffness = stiffness;
    this.damping = damping;
  }

  update(dt: number) {
    // X axis
    let force = (this.target.x - this.current.x) * this.stiffness;
    let damp = -this.velocity.x * this.damping;
    this.velocity.x += (force + damp) * dt;
    this.current.x += this.velocity.x * dt;

    // Y axis
    force = (this.target.y - this.current.y) * this.stiffness;
    damp = -this.velocity.y * this.damping;
    this.velocity.y += (force + damp) * dt;
    this.current.y += this.velocity.y * dt;

    // Z axis
    force = (this.target.z - this.current.z) * this.stiffness;
    damp = -this.velocity.z * this.damping;
    this.velocity.z += (force + damp) * dt;
    this.current.z += this.velocity.z * dt;
  }
}
