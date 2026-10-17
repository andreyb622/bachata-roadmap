import { translate } from '@/shared/i18n/translate';

export const ERROR_CODES = {
  STORAGE_UNAVAILABLE: 'storage_unavailable',
  STORAGE_PARSE_ERROR: 'storage_parse_error',
  STORAGE_INVALID_STRUCTURE: 'storage_invalid_structure',
  STORAGE_RECOVERED_BACKUP: 'storage_recovered_backup',
  STORAGE_RECOVERED_PARTIAL: 'storage_recovered_partial',
  STORAGE_NEW_PROFILE_PARSE: 'storage_new_profile_parse',
  STORAGE_NEW_PROFILE_STRUCTURE: 'storage_new_profile_structure',
  STORAGE_LOAD_RECOVERED: 'storage_load_recovered',
  STORAGE_INIT_FAILED: 'storage_init_failed',
  STORAGE_SAVE_FAILED: 'storage_save_failed',
  STORAGE_QUOTA_EXCEEDED: 'storage_quota_exceeded',

  ENTITY_NAME_REQUIRED: 'entity_name_required',
  ENTITY_NAME_TOO_LONG: 'entity_name_too_long',
  ENTITY_CREATE_FAILED: 'entity_create_failed',
  ENTITY_NOT_FOUND: 'entity_not_found',
  ENTITY_UPDATE_FAILED: 'entity_update_failed',
  ENTITY_DELETE_LAST: 'entity_delete_last',
  ENTITY_DELETE_FAILED: 'entity_delete_failed',
  ENTITY_SWITCH_FAILED: 'entity_switch_failed',
  PROGRESS_SAVE_FAILED: 'progress_save_failed',

  APP_INIT_FAILED: 'app_init_failed',
  APP_UNKNOWN: 'app_unknown',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

type MessageContext = Record<string, string | number | null | undefined>;

export function getGenericMessage(): string {
  return translate('errors.generic');
}

const COUNT_PARAM: Partial<Record<ErrorCode, string>> = {
  [ERROR_CODES.ENTITY_NAME_TOO_LONG]: 'maxLen',
};

const UNKNOWN_COUNT = 5;

const ERROR_NAME_MAP: Record<string, ErrorCode> = {
  QuotaExceededError: ERROR_CODES.STORAGE_QUOTA_EXCEEDED,
  SecurityError: ERROR_CODES.STORAGE_UNAVAILABLE,
};

function isErrorCode(value: string): value is ErrorCode {
  return (Object.values(ERROR_CODES) as string[]).includes(value);
}

function formatMessage(code: ErrorCode, context: MessageContext): string {
  const params: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(context)) {
    if (value !== null && value !== undefined) params[name] = value;
  }
  const countParam = COUNT_PARAM[code];
  if (!countParam) return translate(`errors.${code}`, params);
  const count = Number(params[countParam]);
  params[countParam] ??= `{${countParam}}`;
  return translate(`errors.${code}`, params, Number.isFinite(count) ? count : UNKNOWN_COUNT);
}

function mapErrorInstance(error: Error): ErrorCode | null {
  if ('code' in error && typeof error.code === 'string' && isErrorCode(error.code)) {
    return error.code;
  }

  if (Object.hasOwn(ERROR_NAME_MAP, error.name)) {
    return ERROR_NAME_MAP[error.name] ?? null;
  }

  const message = typeof error.message === 'string' ? error.message.toLowerCase() : '';
  if (message.includes('quota') || message.includes('exceeded')) {
    return ERROR_CODES.STORAGE_QUOTA_EXCEEDED;
  }

  if (message.includes('storage') || message.includes('localstorage')) {
    return ERROR_CODES.STORAGE_UNAVAILABLE;
  }

  return null;
}

export function getUserMessage(codeOrError: unknown, context: MessageContext = {}): string {
  if (typeof codeOrError === 'string') {
    if (isErrorCode(codeOrError)) return formatMessage(codeOrError, context);
    if (codeOrError.trim()) return codeOrError;
    return getGenericMessage();
  }

  if (codeOrError instanceof Error) {
    const mapped = mapErrorInstance(codeOrError);
    if (mapped) return getUserMessage(mapped, context);
    return getGenericMessage();
  }

  return getGenericMessage();
}

export function getStorageRecoveryCode(
  issue: string | null | undefined,
  recoveredFromBackup: boolean,
): ErrorCode | null {
  if (recoveredFromBackup) {
    return issue === 'parse_error'
      ? ERROR_CODES.STORAGE_RECOVERED_BACKUP
      : ERROR_CODES.STORAGE_RECOVERED_PARTIAL;
  }

  if (issue === 'parse_error') return ERROR_CODES.STORAGE_NEW_PROFILE_PARSE;
  if (issue === 'invalid_structure') return ERROR_CODES.STORAGE_NEW_PROFILE_STRUCTURE;
  return null;
}
