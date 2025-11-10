/**
 * Character Select Scene
 *
 * Allows players to choose their animal (Seal, Otter, or Sea Lion).
 * Shows stats, unlock status, and difficulty level for each character.
 */

import Phaser from 'phaser';
import {
  getAllCharacterConfigs,
  CharacterConfig,
  isCharacterUnlocked,
  CharacterType,
} from '../config/characters';
import { UIButton, UIPanel, UIStatBar, UIBadge, UI_COLORS, UI_SPACING, UIAnimations } from '../ui/UIComponents';
import { Character } from '../entities/Character';
import { GAME_CONFIG } from '../config/constants';

export class CharacterSelectScene extends Phaser.Scene {
  private selectedCharacterId: string = 'seal';
  private characterCards: Map<string, CharacterCard> = new Map();
  private statBars: UIStatBar[] = [];
  private playButton?: UIButton;
  private backButton?: UIButton;
  private playerTotalScore: number = 0;

  constructor() {
    super({ key: 'CharacterSelectScene' });
  }

  init(data: { playerTotalScore?: number } = {}): void {
    this.playerTotalScore = data.playerTotalScore || 0;

    // Load selected character from localStorage
    const saved = localStorage.getItem('flappyseal_selected_character');
    if (saved) {
      this.selectedCharacterId = saved;
    }
  }

  create(): void {
    // Fade in
    UIAnimations.fadeIn(this);

    // Title
    const title = this.add.text(GAME_CONFIG.WIDTH / 2, 60, 'Choose Your Animal', {
      fontSize: '48px',
      fontFamily: 'Arial, sans-serif',
      color: '#00d4ff',
      fontStyle: 'bold',
      stroke: '#0a4f6e',
      strokeThickness: 6,
    });
    title.setOrigin(0.5);
    UIAnimations.scalePulse(this, title, 1.05, 2000);

    // Get all characters
    const characters = getAllCharacterConfigs();

    // Create character cards
    const cardWidth = 180;
    const cardSpacing = UI_SPACING.xl;
    const totalWidth = characters.length * cardWidth + (characters.length - 1) * cardSpacing;
    const startX = (GAME_CONFIG.WIDTH - totalWidth) / 2 + cardWidth / 2;
    const cardY = 200;

    characters.forEach((config, index) => {
      const cardX = startX + index * (cardWidth + cardSpacing);
      const card = new CharacterCard(
        this,
        cardX,
        cardY,
        config,
        isCharacterUnlocked(config.id, this.playerTotalScore),
        () => this.selectCharacter(config.id)
      );

      this.characterCards.set(config.id, card);

      // Pop in animation
      UIAnimations.popIn(this, card, index * 100);
    });

    // Selected character info panel
    this.createInfoPanel();

    // Buttons
    this.createButtons();

    // Update selection to show current character
    this.selectCharacter(this.selectedCharacterId, false);
  }

  private createInfoPanel(): void {
    const panelY = 420;

    // Panel background
    new UIPanel(this, GAME_CONFIG.WIDTH / 2, panelY, 600, 180, {
      title: '',
      backgroundColor: UI_COLORS.primaryDark,
      borderColor: UI_COLORS.primary,
      alpha: 0.95,
    });

    // Stats label
    this.add.text(GAME_CONFIG.WIDTH / 2, panelY - 60, 'Stats:', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Stat bars (will be updated on selection)
    const statY = panelY - 20;
    const statSpacing = 35;

    this.statBars = [
      new UIStatBar(this, GAME_CONFIG.WIDTH / 2 - 250, statY, 'Weight', 100, 200, 450, {
        barColor: UI_COLORS.accent,
        showValue: true,
      }),
      new UIStatBar(this, GAME_CONFIG.WIDTH / 2 - 250, statY + statSpacing, 'Power', 100, 200, 450, {
        barColor: UI_COLORS.accentGreen,
        showValue: true,
      }),
      new UIStatBar(this, GAME_CONFIG.WIDTH / 2 - 250, statY + statSpacing * 2, 'Agility', 100, 200, 450, {
        barColor: UI_COLORS.primary,
        showValue: true,
      }),
    ];
  }

  private createButtons(): void {
    const buttonY = 540;

    // Play button
    this.playButton = new UIButton(
      this,
      GAME_CONFIG.WIDTH / 2 - 120,
      buttonY,
      'PLAY',
      200,
      60
    );
    this.playButton.onClick(() => this.startGame());

    // Back button
    this.backButton = new UIButton(
      this,
      GAME_CONFIG.WIDTH / 2 + 120,
      buttonY,
      'BACK',
      200,
      60,
      {
        backgroundColor: UI_COLORS.secondaryDark,
      }
    );
    this.backButton.onClick(() => this.goBack());

    // Slide in from bottom
    UIAnimations.slideInFromBottom(this, this.playButton, 400, 200);
    UIAnimations.slideInFromBottom(this, this.backButton, 400, 250);
  }

  private selectCharacter(characterId: string, playSound: boolean = true): void {
    const config = getAllCharacterConfigs().find(c => c.id === characterId);
    if (!config) return;

    // Check if unlocked
    const unlocked = isCharacterUnlocked(characterId, this.playerTotalScore);

    if (!unlocked) {
      // Show unlock requirement message
      this.showUnlockMessage(config);
      return;
    }

    // Update selection
    this.selectedCharacterId = characterId;

    // Update card visuals
    this.characterCards.forEach((card, id) => {
      card.setSelected(id === characterId);
    });

    // Update stat bars
    if (this.statBars.length >= 3) {
      // Determine bar colors based on stat value
      const weightColor = config.stats.weight > 100 ? UI_COLORS.accentRed :
                          config.stats.weight < 100 ? UI_COLORS.accentGreen :
                          UI_COLORS.accent;

      const powerColor = config.stats.power > 100 ? UI_COLORS.accentGreen :
                         config.stats.power < 100 ? UI_COLORS.accentRed :
                         UI_COLORS.accent;

      const agilityColor = config.stats.agility > 100 ? UI_COLORS.accentGreen :
                           config.stats.agility < 100 ? UI_COLORS.accentRed :
                           UI_COLORS.accent;

      this.statBars[0].animateToValue(config.stats.weight, 200, weightColor, 450, 20, 500);
      this.statBars[1].animateToValue(config.stats.power, 200, powerColor, 450, 20, 500);
      this.statBars[2].animateToValue(config.stats.agility, 200, agilityColor, 450, 20, 500);
    }

    // Save selection
    localStorage.setItem('flappyseal_selected_character', characterId);

    // Play sound
    if (playSound) {
      // TODO: Add selection sound effect
    }
  }

  private showUnlockMessage(config: CharacterConfig): void {
    if (!config.gameplay.unlockCondition) return;

    const message = this.add.text(
      GAME_CONFIG.WIDTH / 2,
      GAME_CONFIG.HEIGHT / 2,
      `🔒 Unlock at ${config.gameplay.unlockCondition.value} total score!\n\nYour score: ${this.playerTotalScore}`,
      {
        fontSize: '24px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffaa00',
        fontStyle: 'bold',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4,
      }
    );
    message.setOrigin(0.5);
    message.setAlpha(0);

    // Fade in and out
    this.tweens.add({
      targets: message,
      alpha: 1,
      duration: 300,
      yoyo: true,
      hold: 1500,
      onComplete: () => {
        message.destroy();
      },
    });
  }

  private startGame(): void {
    // Set character type in registry
    const characterType = this.selectedCharacterId as CharacterType;
    this.registry.set('characterType', characterType);

    console.log(`[CharacterSelectScene] Starting game with ${this.selectedCharacterId}`);

    // Fade out and start game
    UIAnimations.fadeOut(this, 300, () => {
      this.scene.start('GameScene');
    });
  }

  private goBack(): void {
    UIAnimations.fadeOut(this, 300, () => {
      this.scene.start('MenuScene');
    });
  }
}

/**
 * CharacterCard - Visual card for each character
 */
class CharacterCard extends Phaser.GameObjects.Container {
  private config: CharacterConfig;
  private isLocked: boolean;
  private isSelected: boolean = false;
  private background: Phaser.GameObjects.Graphics;
  private characterPreview: Character;
  private nameText: Phaser.GameObjects.Text;
  private difficultyBadge: UIBadge;
  private lockIcon?: Phaser.GameObjects.Text;
  private callback: () => void;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: CharacterConfig,
    isUnlocked: boolean,
    callback: () => void
  ) {
    super(scene, x, y);

    this.config = config;
    this.isLocked = !isUnlocked;
    this.callback = callback;

    const width = 180;
    const height = 240;

    // Background
    this.background = scene.add.graphics();
    this.drawBackground(width, height, false);
    this.add(this.background);

    // Character preview (mini render)
    this.characterPreview = new Character(scene, 0, -40, config);
    this.characterPreview.graphics.setScale(0.8);
    this.add(this.characterPreview.graphics);

    // Name
    this.nameText = scene.add.text(0, 40, config.name, {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      color: '#ffffff',
      fontStyle: 'bold',
      align: 'center',
    });
    this.nameText.setOrigin(0.5);
    this.add(this.nameText);

    // Difficulty badge
    const difficultyColor = this.getDifficultyColor(config.gameplay.difficulty);
    this.difficultyBadge = new UIBadge(scene, 0, 70, config.gameplay.difficulty.toUpperCase(), difficultyColor);
    this.add(this.difficultyBadge);

    // Lock icon if locked
    if (this.isLocked && config.gameplay.unlockCondition) {
      this.lockIcon = scene.add.text(0, -40, '🔒', {
        fontSize: '48px',
      });
      this.lockIcon.setOrigin(0.5);
      this.add(this.lockIcon);

      const unlockText = scene.add.text(0, 95, `${config.gameplay.unlockCondition.value}`, {
        fontSize: '14px',
        fontFamily: 'Arial, sans-serif',
        color: '#ffaa00',
      });
      unlockText.setOrigin(0.5);
      this.add(unlockText);

      // Darken character preview
      this.characterPreview.graphics.setAlpha(0.3);
    }

    // Make interactive
    this.setSize(width, height);
    this.setInteractive({ useHandCursor: !this.isLocked });

    if (!this.isLocked) {
      this.on('pointerover', this.onHover, this);
      this.on('pointerout', this.onOut, this);
      this.on('pointerdown', this.onPress, this);
    }

    scene.add.existing(this);
  }

  private drawBackground(width: number, height: number, isHovered: boolean): void {
    this.background.clear();

    const bgColor = isHovered ? UI_COLORS.primary : UI_COLORS.primaryDark;
    const borderColor = this.isSelected ? UI_COLORS.accent : UI_COLORS.primary;
    const borderWidth = this.isSelected ? 4 : 2;

    this.background.fillStyle(bgColor, 0.9);
    this.background.fillRoundedRect(-width / 2, -height / 2, width, height, 12);

    this.background.lineStyle(borderWidth, borderColor, 1);
    this.background.strokeRoundedRect(-width / 2, -height / 2, width, height, 12);
  }

  private getDifficultyColor(difficulty: string): number {
    switch (difficulty) {
      case 'easy': return UI_COLORS.difficultyEasy;
      case 'hard': return UI_COLORS.difficultyHard;
      default: return UI_COLORS.difficultyMedium;
    }
  }

  private onHover(): void {
    this.drawBackground(180, 240, true);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 100,
    });
  }

  private onOut(): void {
    this.drawBackground(180, 240, false);
    this.scene.tweens.add({
      targets: this,
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 100,
    });
  }

  private onPress(): void {
    if (!this.isLocked) {
      this.callback();
    }
  }

  public setSelected(selected: boolean): void {
    this.isSelected = selected;
    this.drawBackground(180, 240, false);

    if (selected) {
      // Pulse animation
      this.scene.tweens.add({
        targets: this.background,
        alpha: 0.7,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    } else {
      this.scene.tweens.killTweensOf(this.background);
      this.background.setAlpha(1);
    }
  }
}
