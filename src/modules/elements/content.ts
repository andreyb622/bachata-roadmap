export interface ElementItem {
  readonly key: string;
}

export interface ElementsSection {
  readonly key: string;
  readonly items: readonly ElementItem[];
}

export interface ElementsModule {
  readonly key: string;
  readonly sections: readonly ElementsSection[];
}

export interface SoloElementRow {
  readonly key: string;
  readonly num: number;
  readonly module: string;
}

export const ELEMENT_MODULES = [
  {
    key: 'basics',
    sections: [
      {
        key: 'rhythm-and-solo-basics',
        items: [
          { key: 'basic-step' },
          { key: 'step-with-point' },
          { key: 'basic-in-place' },
          { key: 'square' },
          { key: 'v-step' },
          { key: 'side-basic' },
          { key: 'slide' },
          { key: 'cross-step' },
          { key: 'diagonal-madrid-intro' },
          { key: 'forward-back-back-intro' },
          { key: 'stop-step' },
          { key: 'solo-slowdowns' },
          { key: 'solo-turn-on-one' },
          { key: 'reverse-turn-on-one' },
          { key: 'torso-hip-pendulums' },
        ],
      },
      {
        key: 'frame-hold-weight-transfer',
        items: [
          { key: 'weight-transfer-play' },
          { key: 'hold-control-and-figure' },
          { key: 'frame-on-off-walking' },
          { key: 'weight-play-open-position' },
        ],
      },
      {
        key: 'positions',
        items: [
          { key: 'open-position-basic' },
          { key: 'closed-position-basic' },
          { key: 'semi-open-position' },
          { key: 'swing-open-close-volume' },
          { key: 'approach-and-close-partner' },
          { key: 'closed-open-transitions' },
          { key: 'lock-crossed-hands' },
        ],
      },
      {
        key: 'basic-turns',
        items: [
          { key: 'regular-partner-turn' },
          { key: 'frisbee-turn' },
          { key: 'outer-hand-turn' },
          { key: 'hand-turn' },
          { key: 'leader-turns' },
          { key: 'follower-body-turns' },
          { key: 'inner-hand-waist-turn' },
          { key: 'basic-hands-on-turn' },
          { key: 'forward-turn-follower' },
          { key: 'leader-contact-turns' },
          { key: 'lever-turns' },
          { key: 'turn-combinations' },
          { key: 'open-break-on-three-forward-turn' },
          { key: 'closed-position-transitions-via-turn' },
          { key: 'turn-180' },
          { key: 'place-switch-turns' },
        ],
      },
      {
        key: 'walk-intro',
        items: [
          { key: 'no-bachata-beat' },
          { key: 'walk' },
          { key: 'mirrored-hands-walk' },
          { key: 'diagonal-hands-walk' },
          { key: 'direction-change' },
          { key: 'place-change' },
        ],
      },
      {
        key: 'allardo-hammerlock-intro',
        items: [{ key: 'allardo' }, { key: 'hammerlock' }],
      },
    ],
  },
  {
    key: 'hands-and-leading',
    sections: [
      {
        key: 'leading-and-hand-rules',
        items: [
          { key: 'hands-throws-and-turns' },
          { key: 'three-hand-rules' },
          { key: 'impulse-vs-constant-leading' },
          { key: 'contact-keeping-exercise' },
          { key: 'raise-hand-and-close-partner' },
        ],
      },
      {
        key: 'turns',
        items: [
          { key: 'two-hand-turn' },
          { key: 'waist-turns-hands-up' },
          { key: 'shoulder-turn' },
          { key: 'double-hand-turns' },
          { key: 'walk-entry-double-hand-turn' },
          { key: 'lock-contact-break' },
          { key: 'hand-throw-after-turn' },
          { key: 'leader-reverse-turn-after-double' },
          { key: 'reverse-turn' },
          { key: 'forward-turn' },
          { key: 'outer-leader-turn' },
        ],
      },
      {
        key: 'hand-throws',
        items: [
          { key: 'throws-bottom-up' },
          { key: 'two-hand-throws' },
          { key: 'throw-plus-waist-turn' },
          { key: 'wrist-styling' },
        ],
      },
      {
        key: 'allardo-diagonal-hands',
        items: [
          { key: 'diagonal-hand-slide' },
          { key: 'allardo-on-partner-and-self' },
          { key: 'allardo-two-hands-boat' },
        ],
      },
      {
        key: 'hammerlock',
        items: [
          { key: 'hammerlock-mirrored' },
          { key: 'hammerlock-diagonal' },
          { key: 'throw-down-behind-partner' },
          { key: 'forward-steps-place-change' },
        ],
      },
      {
        key: 'walk-and-positions',
        items: [
          { key: 'walk-opening' },
          { key: 'partner-pass' },
          { key: 'closed-corner' },
          { key: 'walk-two' },
          { key: 'side-support-in-walk' },
          { key: 'cbl' },
        ],
      },
      {
        key: 'rompe-adelante-and-paseala',
        items: [
          { key: 'rompe-adelante' },
          { key: 'paseala' },
          { key: 'rompe-adelante-paseala-combo' },
          { key: 'rompe-adelante-lead-follow-parts' },
        ],
      },
      {
        key: 'styling-intro',
        items: [{ key: 'styling-elements' }],
      },
      {
        key: 'module-solo-elements',
        items: [
          { key: 'forward-back-back' },
          { key: 'diagonal-madrid' },
          { key: 'paseala' },
          { key: 'reverse-basic' },
        ],
      },
    ],
  },
  {
    key: 'shadow-and-styling',
    sections: [
      {
        key: 'shadow-position',
        items: [
          { key: 'follower-shadow-first-entry' },
          { key: 'leader-shadow' },
          { key: 'follower-shadow-second-entry' },
          { key: 'shadow-definition' },
          { key: 'shadow-entry-via-turn' },
          { key: 'shadow-partner-turn' },
          { key: 'shadow-swap-and-exit' },
          { key: 'shadow-after-hammerlock' },
          { key: 'rompe-adelante-shadow' },
        ],
      },
      {
        key: 'waves-and-isolation',
        items: [
          { key: 'side-wave' },
          { key: 'side-wave-in-pair' },
          { key: 'side-wave-closed-open' },
          { key: 'forward-wave' },
          { key: 'forward-wave-in-pair' },
          { key: 'frontal-wave-walk-closed' },
          { key: 'side-to-frontal-wave' },
          { key: 'side-wave-level-change' },
          { key: 'slide-frontal-wave' },
          { key: 'side-wave-headroll' },
          { key: 'diagonal-shoulder-wave' },
          { key: 'impulse-vs-wave' },
          { key: 'isolation-walk' },
        ],
      },
      {
        key: 'headroll',
        items: [
          { key: 'headroll-closed-open' },
          { key: 'partners-headroll' },
          { key: 'headroll-forward-accent' },
          { key: 'headroll-back-accent' },
          { key: 'slide-headroll-back' },
        ],
      },
      {
        key: 'fold-slide-culito',
        items: [
          { key: 'fold' },
          { key: 'closed-slide' },
          { key: 'horizontal-hip-circle' },
          { key: 'vertical-lower-pendulum' },
          { key: 'closed-counterbalance' },
          { key: 'intro-combinations' },
        ],
      },
      {
        key: 'windmill-and-combos',
        items: [{ key: 'windmill' }, { key: 'combo-with-hand-changes' }],
      },
      {
        key: 'madrid-and-gancho-intro',
        items: [{ key: 'madrid' }, { key: 'gancho-circle-steps' }],
      },
      {
        key: 'extras',
        items: [
          { key: 'teps' },
          { key: 'syncopated-steps' },
          { key: 'open-break' },
          { key: 'intro-musicality' },
        ],
      },
    ],
  },
  {
    key: 'steps-turns-musicality',
    sections: [
      {
        key: 'steps',
        items: [
          { key: 'madrid-step' },
          { key: 'tango-step' },
          { key: 'dominican-steps' },
          { key: 'delayed-step' },
          { key: 'sakaita-step' },
        ],
      },
      {
        key: 'turns',
        items: [
          { key: 'turn-on-three-seven' },
          { key: 'turn-on-two-six' },
          { key: 'double-turns' },
          { key: 'partners-turn-on-three' },
          { key: 'waist-lever-shadow-turn-on-two' },
          { key: 'push-aside-turn-on-three' },
          { key: 'double-turn-walk-entry' },
          { key: 'follower-turn-headroll' },
          { key: 'turn-on-one-headroll' },
          { key: 'lever-circle-lead' },
          { key: 'reverse-turn-waiter' },
        ],
      },
      {
        key: 'open-break-hammerlock',
        items: [
          { key: 'open-break-mirrored' },
          { key: 'open-break-in-hammerlock' },
          { key: 'reverse-turn-hammerlock' },
        ],
      },
      {
        key: 'wolchek-windmill-slide',
        items: [
          { key: 'wolchek' },
          { key: 'open-slide' },
          { key: 'slide-endings' },
          { key: 'descent-ascent' },
        ],
      },
      {
        key: 'musicality-and-rhythms',
        items: [
          { key: 'music-types' },
          { key: 'footwork-rhythms' },
          { key: 'bass-rhythm' },
          { key: 'rhythm-play-variants' },
          { key: 'sakaita-taki-taki' },
          { key: 'stop-forward-footwork' },
        ],
      },
      {
        key: 'walk-direction-changes',
        items: [
          { key: 'circle-snake-walk' },
          { key: 'direction-change-follower-turns' },
          { key: 'direction-change-hammerlock' },
          { key: 'allardo-turns-walk' },
        ],
      },
      {
        key: 'rompe-adelante-variations',
        items: [
          { key: 'upper-pendulum' },
          { key: 'hand-variations-pause' },
          { key: 'rompe-headroll-forward' },
        ],
      },
    ],
  },
  {
    key: 'advanced',
    sections: [
      {
        key: 'hand-throws-advanced',
        items: [
          { key: 'harder-throws' },
          { key: 'hammerlock-throws' },
          { key: 'throws-after-double-turn' },
          { key: 'elbow-throw-after-turn' },
          { key: 'side-up-throws' },
          { key: 'hammerlock-leader-turn-elbow-throw' },
        ],
      },
      {
        key: 'supports-and-cambre',
        items: [
          { key: 'support-down' },
          { key: 'closed-supports' },
          { key: 'cambre' },
          { key: 'social-supports' },
          { key: 'side-opening' },
          { key: 'wave-headroll-combo' },
          { key: 'cambre-culito' },
        ],
      },
      {
        key: 'headroll-advanced',
        items: [
          { key: 'headroll-back' },
          { key: 'headroll-back-from-side-wave' },
          { key: 'double-headroll' },
          { key: 'leader-headroll' },
        ],
      },
      {
        key: 'waves-and-fold',
        items: [
          { key: 'fold-frontal-open' },
          { key: 'double-wave-basic' },
          { key: 'big-hip-circle' },
          { key: 'level-changes' },
        ],
      },
      {
        key: 'isolation-and-swivels',
        items: [
          { key: 'torso-hip-isolation' },
          { key: 'swivels' },
          { key: 'chest-points-hip-twist' },
          { key: 'pair-swivels' },
        ],
      },
      {
        key: 'decorations-and-statics',
        items: [
          { key: 'walk-hand-decorations' },
          { key: 'forward-turn-decoration' },
          { key: 'soft-point-on-swing' },
          { key: 'static-elements' },
          { key: 'contrast-dance' },
        ],
      },
      {
        key: 'slowdowns-pushes-walk',
        items: [
          { key: 'walk-slowdown' },
          { key: 'length-push' },
          { key: 'frontal-push' },
          { key: 'hand-slide-place-change' },
          { key: 'contact-extension-walk-exit' },
          { key: 'stop-partner' },
        ],
      },
      {
        key: 'footwork',
        items: [{ key: 'leader-hook' }, { key: 'no-lead-footwork' }],
      },
      {
        key: 'turns-and-shadow-advanced',
        items: [
          { key: 'scoop-water-turn' },
          { key: 'hammerlock-circular-arms' },
          { key: 'madrid-cross-shadow' },
          { key: 'shadow-swap' },
        ],
      },
      {
        key: 'styling-lead',
        items: [{ key: 'boat-styling-lead' }, { key: 'music-combo-video' }],
      },
      {
        key: 'extras',
        items: [{ key: 'rond' }],
      },
    ],
  },
] as const satisfies readonly ElementsModule[];

export const SOLO_ELEMENTS_TABLE_ROWS = [
  { key: 'basic-side-forward-back', num: 1, module: '1' },
  { key: 'square', num: 2, module: '1' },
  { key: 'slowdown-two-four', num: 3, module: '1' },
  { key: 'turn-on-one', num: 4, module: '1' },
  { key: 'rompe-adelante-parts', num: 5, module: '2' },
  { key: 'paseala', num: 6, module: '2' },
  { key: 'slide', num: 7, module: '1' },
  { key: 'stop-step', num: 8, module: '1' },
  { key: 'side-basic', num: 9, module: '1' },
  { key: 'forward-back-back', num: 10, module: '2' },
  { key: 'diagonal-madrid', num: 11, module: '2–4' },
  { key: 'v-shaped', num: 12, module: '1' },
  { key: 'side-wave', num: 13, module: '2–3' },
  { key: 'frontal-wave', num: 14, module: '2–3' },
  { key: 'hip-circle-culito', num: 15, module: '2–3' },
  { key: 'headroll', num: 16, module: '3–5' },
  { key: 'reverse-turn-on-one', num: 17, module: '1' },
] as const satisfies readonly SoloElementRow[];
