import type ru from './ru';

export default {
  shell: {
    elementsTitle: 'Elementos por bloques',
    menu: 'Menú',
    version: 'Versión {details}',
    back: 'Volver al programa',
    about: 'Acerca de la aplicación',
    resetProgress: 'Restablecer progreso',
    tabs: { period0: '3 meses', period1: '3–5', period2: '6+' },
    subtitle: {
      loadError: 'Error de carga',
      program: 'Programa de clases',
      elements: '{n} módulo · lista resumida | {n} módulos · lista resumida',
    },
    toast: { progressReset: 'Progreso restablecido' },
    confirm: { reset: '¿Restablecer el progreso de "{name}"?', resetAction: 'Restablecer' },
    info: {
      what: {
        title: 'Qué es',
        text: '{name} es una aplicación móvil con la hoja de ruta de las clases: calentamiento, solo, elementos en pareja y bloques de consulta. Puedes añadirla a la pantalla de inicio y usarla sin conexión.',
      },
      tabs: {
        title: 'Pestañas',
        program: '{label} — el programa por etapas de aprendizaje',
        programLabel: '3 meses / 3–5 / 6+',
        search: '{label} — búsqueda rápida de un elemento por nombre o sección',
        elements: '{label} — la guía resumida de {modules} (en el menú ☰)',
        elementsLabel: '📑 Elementos por bloques',
        modules: '{n} módulo | {n} módulos',
      },
      checklists: {
        title: 'Listas y progreso',
        tap: 'Pulsa un elemento para marcarlo como hecho',
        untap: 'Vuelve a pulsar para quitar la marca',
        bar: 'Sobre la lista — la {label} del periodo actual',
        barLabel: 'barra de progreso',
        counter: 'En el encabezado de la sección — el contador {label}',
        counterLabel: 'hecho / total',
      },
      sections: {
        title: 'Secciones',
        text: 'Pulsa el encabezado de una sección (Calentamiento, Elementos en pareja, etc.) para contraer o expandir la lista.',
      },
      search: {
        title: 'Búsqueda',
        text: 'Escribe el nombre de una figura o sección. Pulsa un resultado: la aplicación abrirá la pestaña y el periodo correspondientes.',
      },
      profiles: {
        title: 'Alumnos y grupos',
        menu: 'En el menú {icon}: lista de alumnos y grupos, creación, guía y restablecimiento',
        switch: '{label} — cambiar, editar y eliminar',
        create: '{label} — progreso independiente para cada uno',
        name: 'Tú eliges el nombre: puede ser una persona o el nombre de un grupo',
        own: 'Cada uno tiene su propio progreso y su última pestaña',
      },
      saving: {
        title: 'Guardado',
        auto: 'El progreso, la lista de alumnos y la última pestaña se guardan automáticamente en el dispositivo',
        offline: 'Tras la primera apertura, la aplicación funciona sin internet',
        backup: 'En cada guardado se crea una copia de seguridad por si los datos se dañan',
        update: 'Actualizar la aplicación {label} a los alumnos ni su progreso',
        updateLabel: 'no elimina',
      },
      updates: {
        title: 'Actualizaciones',
        text: 'Cuando sale una nueva versión, la aplicación la descarga sola la próxima vez que la abras o vuelvas a la pestaña. La página puede recargarse una vez: es normal. Tus datos se conservan.',
      },
      problems: {
        title: 'Si algo sale mal',
        message: 'En la parte inferior de la pantalla aparece un mensaje breve con una explicación',
        corrupted: 'Si los datos están dañados, la aplicación intentará restaurar la última copia',
        unavailable:
          'Si el almacenamiento no está disponible (modo privado, etc.), el progreso no se guardará tras recargar',
        space:
          'No hay espacio suficiente en el dispositivo: libera memoria en los ajustes del navegador',
      },
      install: {
        title: 'Instalación en iPhone',
        text: 'Abre el enlace en {label} → Compartir → "Añadir a pantalla de inicio". No lo abras desde la aplicación Archivos: allí la PWA no funciona.',
      },
      reset: {
        title: 'Restablecer el progreso',
        text: 'El botón {icon} del menú borra las marcas solo del alumno o grupo {label} seleccionado, tras confirmarlo.',
        labelCurrent: 'actual',
      },
    },
  },
} satisfies typeof ru;
