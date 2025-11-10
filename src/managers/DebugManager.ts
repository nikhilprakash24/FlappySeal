/**
 * DebugManager
 *
 * Provides real-time variable exposure and adjustment for testing and tuning.
 * Allows testers to modify gameplay parameters without code changes.
 */

import Phaser from 'phaser';

export interface DebugVariable {
  name: string;           // Display name
  key: string;            // Unique identifier
  category: string;       // Group name

  // Value access
  getter: () => number;
  setter: (val: number) => void;

  // Constraints
  min: number;
  max: number;
  step: number;

  // Metadata
  defaultValue: number;
  unit?: string;
  description?: string;

  // State
  isModified: boolean;    // True if different from default
}

export interface VariableGroup {
  name: string;
  collapsed: boolean;
  variables: DebugVariable[];
}

export interface PerformanceMetrics {
  fps: {
    current: number;
    average: number;
    min: number;
    max: number;
  };
  memory: {
    used: number;
    limit: number;
  };
  frameTime: number;
}

/**
 * DebugManager - Core debug system orchestrator
 */
export class DebugManager {
  private scene: Phaser.Scene;
  private variables: Map<string, DebugVariable> = new Map();
  private groups: Map<string, VariableGroup> = new Map();
  private groupOrder: string[] = [];

  private isVisible: boolean = false;
  private selectedVariableKey: string | null = null;
  private selectedGroupIndex: number = 0;
  private selectedVarIndex: number = 0;

  // UI Elements
  private graphics!: Phaser.GameObjects.Graphics;
  private panelX: number = 450; // Top-right corner
  private panelY: number = 20;
  private panelWidth: number = 330;

  // Input
  private keys!: {
    toggle: Phaser.Input.Keyboard.Key;
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    reset: Phaser.Input.Keyboard.Key;
    save: Phaser.Input.Keyboard.Key;
    load: Phaser.Input.Keyboard.Key;
  };

  // Performance tracking
  private fpsHistory: number[] = [];
  private lastFpsUpdate: number = 0;
  private performanceMetrics: PerformanceMetrics = {
    fps: { current: 60, average: 60, min: 60, max: 60 },
    memory: { used: 0, limit: 0 },
    frameTime: 16.67
  };

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    // Create graphics object for UI rendering
    this.graphics = scene.add.graphics();
    this.graphics.setDepth(10000); // Render on top

    // Setup keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Try to load saved config on startup
    this.loadConfig();
  }

  /**
   * Setup keyboard shortcuts for debug controls
   */
  private setupKeyboardShortcuts(): void {
    const kb = this.scene.input.keyboard;
    if (!kb) return;

    this.keys = {
      toggle: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      reset: kb.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      save: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      load: kb.addKey(Phaser.Input.Keyboard.KeyCodes.L),
    };
  }

  /**
   * Expose a variable for debugging
   */
  public expose(
    category: string,
    name: string,
    key: string,
    getter: () => number,
    setter: (val: number) => void,
    options: {
      min: number;
      max: number;
      step: number;
      defaultValue: number;
      unit?: string;
      description?: string;
    }
  ): void {
    const variable: DebugVariable = {
      name,
      key,
      category,
      getter,
      setter,
      min: options.min,
      max: options.max,
      step: options.step,
      defaultValue: options.defaultValue,
      unit: options.unit,
      description: options.description,
      isModified: false,
    };

    this.variables.set(key, variable);

    // Add to group
    if (!this.groups.has(category)) {
      this.groups.set(category, {
        name: category,
        collapsed: false,
        variables: [],
      });
      this.groupOrder.push(category);
    }

    const group = this.groups.get(category)!;
    group.variables.push(variable);
  }

  /**
   * Get current value of a variable
   */
  public getValue(key: string): number {
    const variable = this.variables.get(key);
    return variable ? variable.getter() : 0;
  }

  /**
   * Set value of a variable
   */
  public setValue(key: string, value: number): void {
    const variable = this.variables.get(key);
    if (!variable) return;

    const clamped = Phaser.Math.Clamp(value, variable.min, variable.max);
    variable.setter(clamped);

    // Mark as modified if different from default
    variable.isModified = Math.abs(clamped - variable.defaultValue) > 0.001;
  }

  /**
   * Adjust variable by step amount
   */
  private adjustVariable(key: string, direction: number): void {
    const variable = this.variables.get(key);
    if (!variable) return;

    const currentValue = variable.getter();
    const newValue = currentValue + (variable.step * direction);
    this.setValue(key, newValue);
  }

  /**
   * Reset variable to default value
   */
  private resetVariable(key: string): void {
    const variable = this.variables.get(key);
    if (!variable) return;

    this.setValue(key, variable.defaultValue);
  }

  /**
   * Reset all variables to defaults
   */
  public resetAll(): void {
    this.variables.forEach((variable) => {
      this.setValue(variable.key, variable.defaultValue);
    });
  }

  /**
   * Toggle debug panel visibility
   */
  public toggle(): void {
    this.isVisible = !this.isVisible;

    if (this.isVisible) {
      this.updatePerformanceMetrics();
    }
  }

  /**
   * Show debug panel
   */
  public show(): void {
    this.isVisible = true;
  }

  /**
   * Hide debug panel
   */
  public hide(): void {
    this.isVisible = false;
  }

  /**
   * Get visibility state
   */
  public getIsVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(): void {
    const now = Date.now();

    // Update FPS every 500ms
    if (now - this.lastFpsUpdate > 500) {
      const currentFps = this.scene.game.loop.actualFps;
      this.fpsHistory.push(currentFps);

      if (this.fpsHistory.length > 60) {
        this.fpsHistory.shift();
      }

      this.performanceMetrics.fps.current = currentFps;
      this.performanceMetrics.fps.average =
        this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length;
      this.performanceMetrics.fps.min = Math.min(...this.fpsHistory);
      this.performanceMetrics.fps.max = Math.max(...this.fpsHistory);

      // Memory (if available)
      const perf = performance as any;
      if (perf.memory) {
        this.performanceMetrics.memory.used = perf.memory.usedJSHeapSize / (1024 * 1024);
        this.performanceMetrics.memory.limit = perf.memory.jsHeapSizeLimit / (1024 * 1024);
      }

      this.performanceMetrics.frameTime = 1000 / currentFps;

      this.lastFpsUpdate = now;
    }
  }

  /**
   * Handle keyboard input for debug navigation
   */
  private handleInput(): void {
    // Toggle visibility
    if (Phaser.Input.Keyboard.JustDown(this.keys.toggle)) {
      this.toggle();
      return;
    }

    if (!this.isVisible) return;

    // Save config
    if (Phaser.Input.Keyboard.JustDown(this.keys.save)) {
      this.saveConfig();
      console.log('[DebugManager] Configuration saved');
      return;
    }

    // Load config
    if (Phaser.Input.Keyboard.JustDown(this.keys.load)) {
      this.loadConfig();
      console.log('[DebugManager] Configuration loaded');
      return;
    }

    // Get currently selected variable
    const selectedVariable = this.getSelectedVariable();

    // Reset current variable
    if (Phaser.Input.Keyboard.JustDown(this.keys.reset)) {
      if (selectedVariable) {
        this.resetVariable(selectedVariable.key);
        console.log(`[DebugManager] Reset ${selectedVariable.name} to default`);
      }
      return;
    }

    // Navigate variables
    if (Phaser.Input.Keyboard.JustDown(this.keys.up)) {
      this.navigateSelection(-1);
    }

    if (Phaser.Input.Keyboard.JustDown(this.keys.down)) {
      this.navigateSelection(1);
    }

    // Adjust value
    if (selectedVariable) {
      if (Phaser.Input.Keyboard.JustDown(this.keys.left)) {
        this.adjustVariable(selectedVariable.key, -1);
      }

      if (Phaser.Input.Keyboard.JustDown(this.keys.right)) {
        this.adjustVariable(selectedVariable.key, 1);
      }
    }
  }

  /**
   * Navigate through variables
   */
  private navigateSelection(direction: number): void {
    const allVariables = this.getAllVariablesFlat();
    if (allVariables.length === 0) return;

    let currentIndex = 0;
    if (this.selectedVariableKey) {
      currentIndex = allVariables.findIndex(v => v.key === this.selectedVariableKey);
    }

    currentIndex += direction;
    currentIndex = Phaser.Math.Clamp(currentIndex, 0, allVariables.length - 1);

    this.selectedVariableKey = allVariables[currentIndex].key;
  }

  /**
   * Get flat list of all variables
   */
  private getAllVariablesFlat(): DebugVariable[] {
    const all: DebugVariable[] = [];
    this.groupOrder.forEach(groupName => {
      const group = this.groups.get(groupName);
      if (group) {
        all.push(...group.variables);
      }
    });
    return all;
  }

  /**
   * Get currently selected variable
   */
  private getSelectedVariable(): DebugVariable | null {
    if (!this.selectedVariableKey) {
      // Auto-select first variable
      const all = this.getAllVariablesFlat();
      if (all.length > 0) {
        this.selectedVariableKey = all[0].key;
        return all[0];
      }
      return null;
    }

    return this.variables.get(this.selectedVariableKey) || null;
  }

  /**
   * Save configuration to localStorage
   */
  public saveConfig(): void {
    const config: Record<string, number> = {};

    this.variables.forEach((variable) => {
      config[variable.key] = variable.getter();
    });

    try {
      localStorage.setItem('flappyseal_debug_config', JSON.stringify(config));
    } catch (e) {
      console.error('[DebugManager] Failed to save config:', e);
    }
  }

  /**
   * Load configuration from localStorage
   */
  public loadConfig(): void {
    try {
      const configJson = localStorage.getItem('flappyseal_debug_config');
      if (!configJson) return;

      const config = JSON.parse(configJson) as Record<string, number>;

      Object.entries(config).forEach(([key, value]) => {
        this.setValue(key, value);
      });
    } catch (e) {
      console.error('[DebugManager] Failed to load config:', e);
    }
  }

  /**
   * Update debug system (call from scene.update)
   */
  public update(): void {
    this.handleInput();

    if (this.isVisible) {
      this.updatePerformanceMetrics();
    }
  }

  /**
   * Render debug UI (call from scene.update after game logic)
   */
  public render(): void {
    if (!this.isVisible) {
      this.graphics.clear();
      return;
    }

    this.graphics.clear();

    // Draw panel background
    this.drawPanel();

    // Draw groups and variables
    let yOffset = this.panelY + 40;
    this.groupOrder.forEach(groupName => {
      const group = this.groups.get(groupName);
      if (!group) return;

      yOffset = this.drawGroup(group, yOffset);
    });

    // Draw performance metrics
    yOffset += 10;
    this.drawPerformanceMetrics(yOffset);

    // Draw controls help at bottom
    this.drawControlsHelp(yOffset + 80);
  }

  /**
   * Draw main panel background
   */
  private drawPanel(): void {
    const g = this.graphics;

    // Semi-transparent dark background
    g.fillStyle(0x000000, 0.85);
    g.fillRoundedRect(this.panelX, this.panelY, this.panelWidth, 520, 8);

    // Border
    g.lineStyle(2, 0x00FFFF, 1);
    g.strokeRoundedRect(this.panelX, this.panelY, this.panelWidth, 520, 8);

    // Header
    g.fillStyle(0x00FFFF, 1);
    const headerText = 'DEBUG PANEL [D]';
    this.drawText(headerText, this.panelX + 10, this.panelY + 10, 16, 0x00FFFF);
  }

  /**
   * Draw a variable group
   */
  private drawGroup(group: VariableGroup, startY: number): number {
    let yOffset = startY;

    // Group header
    this.drawText(
      `▼ ${group.name}`,
      this.panelX + 10,
      yOffset,
      14,
      0xFFFFFF
    );
    yOffset += 20;

    // Variables
    group.variables.forEach(variable => {
      yOffset = this.drawVariable(variable, yOffset);
    });

    return yOffset + 5;
  }

  /**
   * Draw a single variable
   */
  private drawVariable(variable: DebugVariable, yOffset: number): number {
    const isSelected = variable.key === this.selectedVariableKey;
    const currentValue = variable.getter();

    // Background highlight if selected
    if (isSelected) {
      this.graphics.fillStyle(0x333333, 0.5);
      this.graphics.fillRect(this.panelX + 5, yOffset - 2, this.panelWidth - 10, 18);
    }

    // Variable name
    const nameColor = variable.isModified ? 0xFF8800 : 0xCCCCCC;
    this.drawText(
      `  ${variable.name}:`,
      this.panelX + 15,
      yOffset,
      12,
      nameColor
    );

    // Current value
    const valueText = variable.unit
      ? `${currentValue.toFixed(1)}${variable.unit}`
      : currentValue.toFixed(1);

    this.drawText(
      valueText,
      this.panelX + 180,
      yOffset,
      12,
      0xFFFF00
    );

    // Arrows for adjustment (if selected)
    if (isSelected) {
      this.drawText('◀', this.panelX + 260, yOffset, 12, 0x00FF00);
      this.drawText('▶', this.panelX + 300, yOffset, 12, 0x00FF00);
    }

    return yOffset + 18;
  }

  /**
   * Draw performance metrics
   */
  private drawPerformanceMetrics(startY: number): void {
    let yOffset = startY;

    // Section header
    this.graphics.lineStyle(1, 0x666666, 1);
    this.graphics.lineBetween(
      this.panelX + 10,
      yOffset,
      this.panelX + this.panelWidth - 10,
      yOffset
    );
    yOffset += 10;

    this.drawText('PERFORMANCE', this.panelX + 10, yOffset, 14, 0x00FFFF);
    yOffset += 20;

    // FPS
    const fpsColor = this.performanceMetrics.fps.current < 50 ? 0xFF4444 : 0x44FF44;
    this.drawText(
      `FPS: ${this.performanceMetrics.fps.current.toFixed(1)} (avg: ${this.performanceMetrics.fps.average.toFixed(1)})`,
      this.panelX + 15,
      yOffset,
      12,
      fpsColor
    );
    yOffset += 16;

    // Frame time
    const frameTimeColor = this.performanceMetrics.frameTime > 20 ? 0xFF4444 : 0xCCCCCC;
    this.drawText(
      `Frame: ${this.performanceMetrics.frameTime.toFixed(2)}ms`,
      this.panelX + 15,
      yOffset,
      12,
      frameTimeColor
    );
    yOffset += 16;

    // Memory (if available)
    if (this.performanceMetrics.memory.used > 0) {
      this.drawText(
        `Memory: ${this.performanceMetrics.memory.used.toFixed(1)}MB / ${this.performanceMetrics.memory.limit.toFixed(0)}MB`,
        this.panelX + 15,
        yOffset,
        12,
        0xCCCCCC
      );
    }
  }

  /**
   * Draw keyboard controls help
   */
  private drawControlsHelp(startY: number): void {
    this.drawText('↑↓: Navigate | ←→: Adjust | R: Reset | S: Save | L: Load', this.panelX + 10, startY, 10, 0x888888);
  }

  /**
   * Helper to draw text
   */
  private drawText(text: string, x: number, y: number, size: number, color: number): void {
    // For now, we'll use a simple text rendering
    // In production, you'd want to use Phaser.GameObjects.Text for better rendering
    // But for debug purposes, this keeps it lightweight

    // Note: Phaser Graphics doesn't have built-in text rendering
    // We'll need to create text objects instead
    // Let me refactor this to use actual text objects

    const textObj = this.scene.add.text(x, y, text, {
      fontSize: `${size}px`,
      fontFamily: 'monospace',
      color: `#${color.toString(16).padStart(6, '0')}`,
    });
    textObj.setDepth(10001);

    // Store reference for cleanup
    this.scene.time.delayedCall(100, () => {
      textObj.destroy();
    });
  }

  /**
   * Clean up
   */
  public destroy(): void {
    this.graphics.destroy();
  }
}
