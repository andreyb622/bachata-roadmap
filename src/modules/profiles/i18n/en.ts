import type ru from './ru';

export default {
  profiles: {
    entities: {
      title: 'Students and groups',
      empty: 'Nobody here yet.{br}Open the {icon} menu and tap "New student / group".',
      active: 'active',
      edit: 'Edit',
      delete: 'Delete',
    },
    form: {
      createTitle: 'New student / group',
      editTitle: 'Edit',
      create: 'Create',
      save: 'Save',
      label: 'Name or group title',
      placeholder: 'For example: Maria or Group A',
    },
    toast: {
      selected: 'Selected: {name}',
      deleted: 'Deleted: {name}',
      deletedFallback: 'entry',
      renamed: 'Name updated',
      created: 'Created: {name}',
    },
    confirm: {
      delete: 'Delete "{name}"? Progress will be lost.',
      deleteAction: 'Delete',
    },
  },
} satisfies typeof ru;
