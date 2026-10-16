import { describe, it, expect } from 'vitest';
import { formatVersionLabel } from '../version';

describe('formatVersionLabel', () => {
  it('shows version, build date as DD.MM.YYYY and commit', () => {
    expect(formatVersionLabel('2.0.0', '2026-10-16', 'a1b2c3d')).toBe(
      'Версия 2.0.0 · 16.10.2026 · a1b2c3d',
    );
  });

  it('keeps an unexpected date format as is', () => {
    expect(formatVersionLabel('2.0.0', 'unknown', 'dev')).toBe('Версия 2.0.0 · unknown · dev');
  });
});
