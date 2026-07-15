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
};

export const GENERIC_MESSAGE = 'Что-то пошло не так. Попробуйте ещё раз или перезагрузите страницу.';

const MESSAGES = {
  [ERROR_CODES.STORAGE_UNAVAILABLE]: 'Хранилище недоступно — прогресс не сохранится после перезагрузки',
  [ERROR_CODES.STORAGE_PARSE_ERROR]: 'Сохранённые данные повреждены и не читаются',
  [ERROR_CODES.STORAGE_INVALID_STRUCTURE]: 'Сохранённые данные имеют неверную структуру',
  [ERROR_CODES.STORAGE_RECOVERED_BACKUP]: 'Данные повреждены — восстановлена последняя сохранённая копия',
  [ERROR_CODES.STORAGE_RECOVERED_PARTIAL]: 'Данные частично повреждены — восстановлена последняя копия',
  [ERROR_CODES.STORAGE_NEW_PROFILE_PARSE]: 'Данные повреждены — создан новый профиль, резервная копия сохранена',
  [ERROR_CODES.STORAGE_NEW_PROFILE_STRUCTURE]: 'Структура данных повреждена — создан новый профиль, резервная копия сохранена',
  [ERROR_CODES.STORAGE_LOAD_RECOVERED]: 'Ошибка загрузки — восстановлена последняя сохранённая копия',
  [ERROR_CODES.STORAGE_INIT_FAILED]: 'Не удалось загрузить сохранённые данные — создан новый профиль',
  [ERROR_CODES.STORAGE_SAVE_FAILED]: 'Не удалось сохранить изменения на устройстве',
  [ERROR_CODES.STORAGE_QUOTA_EXCEEDED]: 'Недостаточно места на устройстве — удалите лишние данные браузера',

  [ERROR_CODES.ENTITY_NAME_REQUIRED]: 'Введите имя или название',
  [ERROR_CODES.ENTITY_NAME_TOO_LONG]: 'Слишком длинное имя — сократите до {maxLen} символов',
  [ERROR_CODES.ENTITY_CREATE_FAILED]: 'Не удалось создать ученика или группу',
  [ERROR_CODES.ENTITY_NOT_FOUND]: 'Запись не найдена — обновите список',
  [ERROR_CODES.ENTITY_UPDATE_FAILED]: 'Не удалось сохранить имя',
  [ERROR_CODES.ENTITY_DELETE_LAST]: 'Нельзя удалить последнего ученика или группу',
  [ERROR_CODES.ENTITY_DELETE_FAILED]: 'Не удалось удалить запись',
  [ERROR_CODES.ENTITY_SWITCH_FAILED]: 'Не удалось переключить ученика или группу',
  [ERROR_CODES.PROGRESS_SAVE_FAILED]: 'Не удалось сохранить прогресс',

  [ERROR_CODES.APP_INIT_FAILED]: 'Не удалось загрузить приложение — перезагрузите страницу',
  [ERROR_CODES.APP_UNKNOWN]: GENERIC_MESSAGE,
};

const ERROR_NAME_MAP = {
  QuotaExceededError: ERROR_CODES.STORAGE_QUOTA_EXCEEDED,
  SecurityError: ERROR_CODES.STORAGE_UNAVAILABLE,
};

function formatMessage(template, context = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => (
    context[key] != null ? String(context[key]) : `{${key}}`
  ));
}

function mapErrorInstance(error) {
  if (!error) return null;

  if (error.code && MESSAGES[error.code]) {
    return error.code;
  }

  if (error.name && ERROR_NAME_MAP[error.name]) {
    return ERROR_NAME_MAP[error.name];
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

export function getUserMessage(codeOrError, context = {}) {
  if (typeof codeOrError === 'string') {
    const template = MESSAGES[codeOrError];
    if (template) return formatMessage(template, context);
    if (codeOrError.trim()) return codeOrError;
    return GENERIC_MESSAGE;
  }

  if (codeOrError instanceof Error) {
    const mapped = mapErrorInstance(codeOrError);
    if (mapped) return getUserMessage(mapped, context);
    return GENERIC_MESSAGE;
  }

  return GENERIC_MESSAGE;
}

export function getStorageRecoveryCode(issue, recoveredFromBackup) {
  if (recoveredFromBackup) {
    return issue === 'parse_error'
      ? ERROR_CODES.STORAGE_RECOVERED_BACKUP
      : ERROR_CODES.STORAGE_RECOVERED_PARTIAL;
  }

  if (issue === 'parse_error') return ERROR_CODES.STORAGE_NEW_PROFILE_PARSE;
  if (issue === 'invalid_structure') return ERROR_CODES.STORAGE_NEW_PROFILE_STRUCTURE;
  return null;
}
