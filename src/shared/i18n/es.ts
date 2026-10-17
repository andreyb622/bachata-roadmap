import type ru from './ru';

export default {
  app: { name: 'Bachata Roadmap' },
  ui: { close: 'Cerrar', cancel: 'Cancelar', progress: 'Progreso' },
  errors: {
    storage_unavailable:
      'El almacenamiento no está disponible: el progreso no se guardará tras recargar',
    storage_parse_error: 'Los datos guardados están dañados y no se pueden leer',
    storage_invalid_structure: 'Los datos guardados tienen una estructura no válida',
    storage_recovered_backup: 'Los datos estaban dañados: se restauró la última copia guardada',
    storage_recovered_partial:
      'Los datos estaban parcialmente dañados: se restauró la última copia',
    storage_new_profile_parse:
      'Los datos estaban dañados: se creó un perfil nuevo y se guardó una copia de seguridad',
    storage_new_profile_structure:
      'La estructura de los datos estaba dañada: se creó un perfil nuevo y se guardó una copia de seguridad',
    storage_load_recovered: 'Error de carga: se restauró la última copia guardada',
    storage_init_failed: 'No se pudieron cargar los datos guardados: se creó un perfil nuevo',
    storage_save_failed: 'No se pudieron guardar los cambios en el dispositivo',
    storage_quota_exceeded:
      'No hay espacio suficiente en el dispositivo: elimina datos del navegador',
    entity_name_required: 'Introduce un nombre o título',
    entity_name_too_long:
      'Nombre demasiado largo: acórtalo a {maxLen} carácter | Nombre demasiado largo: acórtalo a {maxLen} caracteres',
    entity_create_failed: 'No se pudo crear el alumno o grupo',
    entity_not_found: 'Registro no encontrado: actualiza la lista',
    entity_update_failed: 'No se pudo guardar el nombre',
    entity_delete_last: 'No se puede eliminar el último alumno o grupo',
    entity_delete_failed: 'No se pudo eliminar el registro',
    entity_switch_failed: 'No se pudo cambiar de alumno o grupo',
    progress_save_failed: 'No se pudo guardar el progreso',
    app_init_failed: 'No se pudo cargar la aplicación: recarga la página',
    app_unknown: 'Algo salió mal. Inténtalo de nuevo o recarga la página.',
    generic: 'Algo salió mal. Inténtalo de nuevo o recarga la página.',
  },
} satisfies typeof ru;
