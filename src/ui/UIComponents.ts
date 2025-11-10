/**
 * UI Component Library
 *
 * Reusable UI components with consistent styling and animations.
 * All components follow the FlappySeal design system.
 */

import Phaser from 'phaser';

// Design system constants
export const UI_COLORS = {
  // Primary (Ocean Theme)
  primary: 0x00d4ff,
  primaryDark: 0x0a4f6e,

  // Secondary
  secondary: 0xffffff,
  secondaryDark: 0xcccccc,

  // Accent
  accent: 0xffaa00,
  accentGreen: 0x44ff44,
  accentRed: 0xff4444,

  // Difficulty colors
  difficultyEasy: 0x44ff44,
  difficultyMedium: 0xffaa00,
  difficultyHard: 0xff4444,

  // Text
  textPrimary: 0xffffff,
  textSecondary: 0xcccccc,
  textDisabled: 0x666666,
};

export const UI_SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const UI_RADIUS = {
  sm: 4,
  md: 8,
  lg: 16,
  pill: 999,
};

/**
 * UIButton - Stylized button with hover and press effects
 */
export class UIButton extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private label: Phaser.GameObjects.Text;
  private isHovered: boolean = false;
  private isPressed: boolean = false;
  private isDisabled: boolean = false;
  private callback?: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    width: number = 200,
    height: number = 50,
    style: {
      backgroundColor?: number;
      textColor?: number;
      fontSize?: string;
      borderRadius?: number;
    } = {}
  ) {
    super(scene, x, y);

    const bgColor = style.backgroundColor || UI_COLORS.primary;
    const textColor = style.textColor || UI_COLORS.textPrimary;
    const fontSize = style.fontSize || '24px';
    const radius = style.borderRadius || UI_RADIUS.md;

    // Background
    this.background = scene.add.graphics();
    this.drawBackground(bgColor, width, height, radius);
    this.add(this.background);

    // Label
    this.label = scene.add.text(0, 0, text, {
      fontSize: fontSize,
      fontFamily: 'Arial, sans-serif',
      color: `#${textColor.toString(16).padStart(6, '0')}`,
      fontStyle: 'bold',
    });
    this.label.setOrigin(0.5);
    this.add(this.label);

    // Make interactive
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: true });

    // Event handlers
    this.on('pointerover', this.onHover, this);
    this.on('pointerout', this.onOut, this);
    this.on('pointerdown', this.onPress, this);
    this.on('pointerup', this.onRelease, this);

    scene.add.existing(this);
  }

  private drawBackground(color: number, width: number, height: number, radius: number): void {
    this.background.clear();
    this.background.fillStyle(color, 1);
    this.background.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

    // Border
    this.background.lineStyle(2, UI_COLORS.secondary, 0.3);
    this.background.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  }

  private onHover(): void {
    if (this.isDisabled) return;
    this.isHovered = true;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
      ease: 'Power2',
    });

    this.background.clear();
    this.drawBackground(UI_COLORS.accent, this.width as number, this.height as number, UI_RADIUS.md);
  }

  private onOut(): void {
    if (this.isDisabled) return;
    this.isHovered = false;
    this.isPressed = false;

    this.scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 100,
      ease: 'Power2',
    });

    this.background.clear();
    this.drawBackground(UI_COLORS.primary, this.width as number, this.height as number, UI_RADIUS.md);
  }

  private onPress(): void {
    if (this.isDisabled) return;
    this.isPressed = true;

    this.scene.tweens.add({
      targets: this,
      scaleX: 0.95,
      scaleY: 0.95,
      duration: 50,
      ease: 'Power2',
    });
  }

  private onRelease(): void {
    if (this.isDisabled) return;
    this.isPressed = false;

    this.scene.tweens.add({
      targets: this,
      scaleX: this.isHovered ? 1.05 : 1.0,
      scaleY: this.isHovered ? 1.05 : 1.0,
      duration: 50,
      ease: 'Power2',
    });

    if (this.callback) {
      this.callback();
    }
  }

  public onClick(callback: () => void): void {
    this.callback = callback;
  }

  public setDisabled(disabled: boolean): void {
    this.isDisabled = disabled;
    this.label.setColor(disabled ? '#666666' : '#ffffff');
    this.setAlpha(disabled ? 0.5 : 1.0);
    this.setInteractive(!disabled);
  }

  public setText(text: string): void {
    this.label.setText(text);
  }
}

/**
 * UIPanel - Stylized panel with optional title
 */
export class UIPanel extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Graphics;
  private titleText?: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    options: {
      title?: string;
      backgroundColor?: number;
      borderColor?: number;
      borderRadius?: number;
      alpha?: number;
    } = {}
  ) {
    super(scene, x, y);

    const bgColor = options.backgroundColor || UI_COLORS.primaryDark;
    const borderColor = options.borderColor || UI_COLORS.primary;
    const radius = options.borderRadius || UI_RADIUS.lg;
    const alpha = options.alpha || 0.9;

    // Background
    this.background = scene.add.graphics();
    this.background.fillStyle(bgColor, alpha);
    this.background.fillRoundedRect(-width / 2, -height / 2, width, height, radius);

    // Border
    this.background.lineStyle(3, borderColor, 1);
    this.background.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);

    this.add(this.background);

    // Title if provided
    if (options.title) {
      this.titleText = scene.add.text(0, -height / 2 + UI_SPACING.md, options.title, {
        fontSize: '28px',
        fontFamily: 'Arial, sans-serif',
        color: '#00d4ff',
        fontStyle: 'bold',
      });
      this.titleText.setOrigin(0.5, 0);
      this.add(this.titleText);
    }

    scene.add.existing(this);
  }

  public getContentY(): number {
    if (this.titleText) {
      return this.titleText.y + this.titleText.height + UI_SPACING.md;
    }
    return -(this.height as number) / 2 + UI_SPACING.md;
  }
}

/**
 * UIStatBar - Animated stat bar with label and value
 */
export class UIStatBar extends Phaser.GameObjects.Container {
  private label: Phaser.GameObjects.Text;
  private bgBar: Phaser.GameObjects.Graphics;
  private fillBar: Phaser.GameObjects.Graphics;
  private valueText: Phaser.GameObjects.Text;
  private currentValue: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    label: string,
    value: number,
    maxValue: number = 200,
    width: number = 200,
    options: {
      barColor?: number;
      showValue?: boolean;
    } = {}
  ) {
    super(scene, x, y);

    const barColor = options.barColor || UI_COLORS.primary;
    const showValue = options.showValue !== false;
    const barHeight = 20;

    // Label
    this.label = scene.add.text(-width / 2, -10, label, {
      fontSize: '16px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
    });
    this.label.setOrigin(0, 0.5);
    this.add(this.label);

    // Background bar
    this.bgBar = scene.add.graphics();
    this.bgBar.fillStyle(0x333333, 1);
    this.bgBar.fillRoundedRect(-width / 2, 0, width, barHeight, 4);
    this.add(this.bgBar);

    // Fill bar
    this.fillBar = scene.add.graphics();
    this.add(this.fillBar);

    // Value text
    if (showValue) {
      this.valueText = scene.add.text(width / 2 + UI_SPACING.sm, 10, value.toString(), {
        fontSize: '16px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      this.valueText.setOrigin(0, 0.5);
      this.add(this.valueText);
    }

    // Set initial value
    this.setValue(value, maxValue, barColor, width, barHeight);

    scene.add.existing(this);
  }

  public setValue(value: number, maxValue: number, barColor: number, width: number, barHeight: number): void {
    this.currentValue = value;
    const fillWidth = (value / maxValue) * width;

    this.fillBar.clear();
    this.fillBar.fillStyle(barColor, 1);
    this.fillBar.fillRoundedRect(-width / 2, 0, fillWidth, barHeight, 4);

    if (this.valueText) {
      this.valueText.setText(value.toString());
    }
  }

  public animateToValue(
    value: number,
    maxValue: number,
    barColor: number,
    width: number,
    barHeight: number,
    duration: number = 500
  ): void {
    const startValue = this.currentValue;

    this.scene.tweens.addCounter({
      from: startValue,
      to: value,
      duration: duration,
      ease: 'Power2',
      onUpdate: (tween) => {
        const currentValue = tween.getValue();
        this.setValue(Math.round(currentValue), maxValue, barColor, width, barHeight);
      },
    });
  }
}

/**
 * UIBadge - Small badge for difficulty, status, etc.
 */
export class UIBadge extends Phaser.GameObjects.Container {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    color: number = UI_COLORS.accent
  ) {
    super(scene, x, y);

    const padding = UI_SPACING.sm;
    const height = 24;

    // Create text first to get width
    const label = scene.add.text(0, 0, text, {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    label.setOrigin(0.5);

    const width = label.width + padding * 2;

    // Background
    const background = scene.add.graphics();
    background.fillStyle(color, 1);
    background.fillRoundedRect(-width / 2, -height / 2, width, height, UI_RADIUS.pill);

    this.add(background);
    this.add(label);

    scene.add.existing(this);
  }
}

/**
 * UI Animation helpers
 */
export class UIAnimations {
  /**
   * Fade in scene
   */
  static fadeIn(scene: Phaser.Scene, duration: number = 300): void {
    const camera = scene.cameras.main;
    camera.fadeIn(duration);
  }

  /**
   * Fade out scene
   */
  static fadeOut(scene: Phaser.Scene, duration: number = 300, callback?: () => void): void {
    const camera = scene.cameras.main;
    camera.fadeOut(duration);

    if (callback) {
      scene.time.delayedCall(duration, callback);
    }
  }

  /**
   * Scale pulse animation
   */
  static scalePulse(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    scale: number = 1.1,
    duration: number = 1000
  ): Phaser.Tweens.Tween {
    return scene.tweens.add({
      targets: target,
      scaleX: scale,
      scaleY: scale,
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Float animation (up and down)
   */
  static float(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    distance: number = 10,
    duration: number = 2000
  ): Phaser.Tweens.Tween {
    const startY = (target as any).y;
    return scene.tweens.add({
      targets: target,
      y: startY - distance,
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  /**
   * Pop in animation
   */
  static popIn(scene: Phaser.Scene, target: Phaser.GameObjects.GameObject, delay: number = 0): void {
    (target as any).setScale(0);
    scene.tweens.add({
      targets: target,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      delay: delay,
      ease: 'Back.easeOut',
    });
  }

  /**
   * Slide in from bottom
   */
  static slideInFromBottom(
    scene: Phaser.Scene,
    target: Phaser.GameObjects.GameObject,
    duration: number = 300,
    delay: number = 0
  ): void {
    const startY = (target as any).y;
    (target as any).y = scene.cameras.main.height + 100;

    scene.tweens.add({
      targets: target,
      y: startY,
      duration: duration,
      delay: delay,
      ease: 'Power2',
    });
  }

  /**
   * Count up animation for numbers
   */
  static countUp(
    scene: Phaser.Scene,
    textObject: Phaser.GameObjects.Text,
    from: number,
    to: number,
    duration: number = 1000,
    prefix: string = '',
    suffix: string = ''
  ): void {
    scene.tweens.addCounter({
      from: from,
      to: to,
      duration: duration,
      ease: 'Power2',
      onUpdate: (tween) => {
        const value = Math.round(tween.getValue());
        textObject.setText(`${prefix}${value}${suffix}`);
      },
    });
  }
}
