import type ru from './ru';

export default {
  app: { name: 'Bachata Roadmap' },
  ui: { close: 'Close', cancel: 'Cancel', progress: 'Progress' },
  errors: {
    storage_unavailable: 'Storage is unavailable — progress will not be saved after a reload',
    storage_parse_error: 'Saved data is corrupted and cannot be read',
    storage_invalid_structure: 'Saved data has an invalid structure',
    storage_recovered_backup: 'Data was corrupted — the last saved copy was restored',
    storage_recovered_partial: 'Data was partially corrupted — the last copy was restored',
    storage_new_profile_parse: 'Data was corrupted — a new profile was created, a backup was kept',
    storage_new_profile_structure:
      'Data structure was corrupted — a new profile was created, a backup was kept',
    storage_load_recovered: 'Loading error — the last saved copy was restored',
    storage_init_failed: 'Could not load saved data — a new profile was created',
    storage_save_failed: 'Could not save changes on the device',
    storage_quota_exceeded: 'Not enough space on the device — clear some browser data',
    entity_name_required: 'Enter a name or title',
    entity_name_too_long:
      'Name is too long — shorten it to {maxLen} character | Name is too long — shorten it to {maxLen} characters',
    entity_create_failed: 'Could not create the student or group',
    entity_not_found: 'Entry not found — refresh the list',
    entity_update_failed: 'Could not save the name',
    entity_delete_last: 'You cannot delete the last student or group',
    entity_delete_failed: 'Could not delete the entry',
    entity_switch_failed: 'Could not switch the student or group',
    progress_save_failed: 'Could not save progress',
    app_init_failed: 'Could not load the app — reload the page',
    app_unknown: 'Something went wrong. Try again or reload the page.',
    generic: 'Something went wrong. Try again or reload the page.',
  },
} satisfies typeof ru;
