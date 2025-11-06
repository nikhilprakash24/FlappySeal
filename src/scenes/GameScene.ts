import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private seal?: Phaser.GameObjects.Graphics;
  private velocity: number = 0;
  private readonly gravity: number = 0.5;
  private readonly swimUpForce: number = -8;
  private readonly diveDawnForce: number = 12;
  private bubbles?: Phaser.GameObjects.Graphics[];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    // Add underwater background effect
    this.createWaterEffect();

    // Create seal (simple graphics for now)
    this.seal = this.add.graphics();
    this.drawSeal(this.seal, 200, 300);

    // Add welcome text
    const titleText = this.add.text(400, 100, 'FlappySeal 🦭', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
      stroke: '#003d5b',
      strokeThickness: 6,
    }).setOrigin(0.5);

    const instructionText = this.add.text(400, 500, 'Left Click: Swim Up | Right Click: Dive Down', {
      fontSize: '20px',
      color: '#ffffff',
      stroke: '#003d5b',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // Add floating animation to text
    this.tweens.add({
      targets: titleText,
      y: 90,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Setup controls
    this.setupControls();

    // Create bubbles
    this.bubbles = [];
    this.time.addEvent({
      delay: 1000,
      callback: this.createBubble,
      callbackScope: this,
      loop: true,
    });
  }

  private createWaterEffect(): void {
    // Create depth layers for underwater effect
    const layer1 = this.add.rectangle(400, 300, 800, 600, 0x0a4f6e, 0.3);
    const layer2 = this.add.rectangle(400, 300, 800, 600, 0x0d5f7e, 0.2);

    // Add some light rays
    for (let i = 0; i < 5; i++) {
      const ray = this.add.rectangle(
        100 + i * 180,
        -100,
        40,
        800,
        0xffffff,
        0.05
      ).setAngle(15);

      this.tweens.add({
        targets: ray,
        alpha: 0.1,
        duration: 3000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  private drawSeal(graphics: Phaser.GameObjects.Graphics, x: number, y: number): void {
    graphics.clear();

    // Seal body (dark gray)
    graphics.fillStyle(0x3a3a3a, 1);
    graphics.fillEllipse(x, y, 60, 35);

    // Seal head
    graphics.fillEllipse(x + 40, y - 5, 35, 30);

    // Flippers
    graphics.fillEllipse(x - 20, y + 15, 25, 15);
    graphics.fillEllipse(x + 10, y + 15, 25, 15);

    // Tail
    graphics.fillTriangle(
      x - 35, y - 10,
      x - 35, y + 10,
      x - 50, y
    );

    // Eye
    graphics.fillStyle(0xffffff, 1);
    graphics.fillCircle(x + 45, y - 10, 5);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(x + 47, y - 10, 3);

    // Nose
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(x + 58, y, 3);

    // Whiskers
    graphics.lineStyle(1, 0x000000, 0.5);
    for (let i = -1; i <= 1; i++) {
      graphics.lineBetween(x + 55, y + i * 5, x + 70, y + i * 7);
    }
  }

  private setupControls(): void {
    // Mouse/Touch controls
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      const centerX = this.cameras.main.width / 2;

      if (pointer.x < centerX) {
        // Left side: Swim up
        this.velocity = this.swimUpForce;
        this.createSplash(this.seal!.x, this.seal!.y, true);
      } else {
        // Right side: Dive down
        this.velocity = this.diveDawnForce;
        this.createSplash(this.seal!.x, this.seal!.y, false);
      }
    });

    // Keyboard controls (alternative)
    this.input.keyboard?.on('keydown-UP', () => {
      this.velocity = this.swimUpForce;
    });

    this.input.keyboard?.on('keydown-DOWN', () => {
      this.velocity = this.diveDawnForce;
    });
  }

  private createSplash(x: number, y: number, isUp: boolean): void {
    const particles = this.add.particles(x, y, 'bubble', {
      speed: { min: 50, max: 100 },
      angle: isUp ? { min: 45, max: 135 } : { min: 225, max: 315 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      quantity: 5,
    });

    this.time.delayedCall(600, () => {
      particles.destroy();
    });
  }

  private createBubble(): void {
    const bubble = this.add.graphics();
    const x = Phaser.Math.Between(50, 750);
    const y = 650;
    const size = Phaser.Math.Between(5, 15);

    bubble.fillStyle(0xffffff, 0.3);
    bubble.fillCircle(x, y, size);

    this.tweens.add({
      targets: bubble,
      y: -50,
      x: x + Phaser.Math.Between(-30, 30),
      alpha: 0,
      duration: Phaser.Math.Between(3000, 5000),
      ease: 'Sine.easeInOut',
      onComplete: () => {
        bubble.destroy();
      },
    });
  }

  update(): void {
    if (!this.seal) return;

    // Apply gravity
    this.velocity += this.gravity;

    // Update seal position
    const currentY = this.seal.y;
    const newY = currentY + this.velocity;

    // Keep seal within bounds
    if (newY < 50) {
      this.seal.y = 50;
      this.velocity = 0;
    } else if (newY > 550) {
      this.seal.y = 550;
      this.velocity = 0;
    } else {
      this.seal.y = newY;
    }

    // Redraw seal at new position
    this.drawSeal(this.seal, this.seal.x, this.seal.y);

    // Rotate seal based on velocity
    const angle = Phaser.Math.Clamp(this.velocity * 2, -30, 30);
    this.seal.setRotation(Phaser.Math.DegToRad(angle));
  }
}
