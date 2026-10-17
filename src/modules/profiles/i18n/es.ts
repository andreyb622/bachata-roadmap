import type ru from './ru';

export default {
  profiles: {
    entities: {
      title: 'Alumnos y grupos',
      empty: 'Todavía no hay nadie.{br}Abre el menú {icon} y pulsa "Nuevo alumno / grupo".',
      active: 'activo',
      edit: 'Editar',
      delete: 'Eliminar',
    },
    form: {
      createTitle: 'Nuevo alumno / grupo',
      editTitle: 'Editar',
      create: 'Crear',
      save: 'Guardar',
      label: 'Nombre o título del grupo',
      placeholder: 'Por ejemplo: María o Grupo A',
    },
    toast: {
      selected: 'Seleccionado: {name}',
      deleted: 'Eliminado: {name}',
      deletedFallback: 'registro',
      renamed: 'Nombre actualizado',
      created: 'Creado: {name}',
    },
    confirm: {
      delete: '¿Eliminar "{name}"? Se perderá el progreso.',
      deleteAction: 'Eliminar',
    },
  },
} satisfies typeof ru;
