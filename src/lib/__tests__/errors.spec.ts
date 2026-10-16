import { describe, it, expect } from 'vitest';
import { ERROR_CODES, GENERIC_MESSAGE, getStorageRecoveryCode, getUserMessage } from '@/lib/errors';

const quotaMessage = getUserMessage(ERROR_CODES.STORAGE_QUOTA_EXCEEDED);
const unavailableMessage = getUserMessage(ERROR_CODES.STORAGE_UNAVAILABLE);

describe('getUserMessage', () => {
  it('returns the message for a known code', () => {
    expect(getUserMessage(ERROR_CODES.ENTITY_NAME_REQUIRED)).toBe('Введите имя или название');
  });

  it('substitutes context values', () => {
    expect(getUserMessage(ERROR_CODES.ENTITY_NAME_TOO_LONG, { maxLen: 40 })).toBe(
      'Слишком длинное имя — сократите до 40 символов',
    );
  });

  it('keeps the placeholder without context', () => {
    expect(getUserMessage(ERROR_CODES.ENTITY_NAME_TOO_LONG)).toBe(
      'Слишком длинное имя — сократите до {maxLen} символов',
    );
  });

  it('keeps the placeholder for a null context value', () => {
    expect(getUserMessage(ERROR_CODES.ENTITY_NAME_TOO_LONG, { maxLen: null })).toBe(
      'Слишком длинное имя — сократите до {maxLen} символов',
    );
  });

  it('returns an unknown non-blank string as is', () => {
    expect(getUserMessage('Своё сообщение')).toBe('Своё сообщение');
  });

  it('returns the generic message for a blank string', () => {
    expect(getUserMessage('   ')).toBe(GENERIC_MESSAGE);
  });

  it('maps an Error with a known code', () => {
    const error = Object.assign(new Error('x'), { code: ERROR_CODES.STORAGE_SAVE_FAILED });
    expect(getUserMessage(error)).toBe(getUserMessage(ERROR_CODES.STORAGE_SAVE_FAILED));
  });

  it.each([
    ['QuotaExceededError', quotaMessage],
    ['SecurityError', unavailableMessage],
  ])('maps an Error named %s', (name, expected) => {
    const error = new Error('x');
    error.name = name;
    expect(getUserMessage(error)).toBe(expected);
  });

  it.each([
    ['quota', quotaMessage],
    ['exceeded', quotaMessage],
    ['storage', unavailableMessage],
    ['localStorage', unavailableMessage],
  ])('maps an Error with message "%s"', (message, expected) => {
    expect(getUserMessage(new Error(message))).toBe(expected);
  });

  it('returns the generic message for a plain Error', () => {
    expect(getUserMessage(new Error('boom'))).toBe(GENERIC_MESSAGE);
  });

  it.each([null, undefined, {}, 42])('returns the generic message for %j', (value) => {
    expect(getUserMessage(value)).toBe(GENERIC_MESSAGE);
  });
});

describe('getStorageRecoveryCode', () => {
  it.each([
    ['parse_error', true, ERROR_CODES.STORAGE_RECOVERED_BACKUP],
    ['invalid_structure', true, ERROR_CODES.STORAGE_RECOVERED_PARTIAL],
    [null, true, ERROR_CODES.STORAGE_RECOVERED_PARTIAL],
    ['parse_error', false, ERROR_CODES.STORAGE_NEW_PROFILE_PARSE],
    ['invalid_structure', false, ERROR_CODES.STORAGE_NEW_PROFILE_STRUCTURE],
    ['other', false, null],
    [undefined, false, null],
  ])('issue %j, recovered %j -> %j', (issue, recovered, expected) => {
    expect(getStorageRecoveryCode(issue, recovered)).toBe(expected);
  });
});
