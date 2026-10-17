import type ru from './ru';

export default {
  shell: {
    elementsTitle: 'Elements by blocks',
    menu: 'Menu',
    version: 'Version {details}',
    back: 'Back to the program',
    about: 'About the app',
    resetProgress: 'Reset progress',
    subtitle: {
      loadError: 'Loading error',
      program: 'Class program',
      elements: '{n} module · summary list | {n} modules · summary list',
    },
    toast: { progressReset: 'Progress reset' },
    confirm: { reset: 'Reset progress for "{name}"?', resetAction: 'Reset' },
    info: {
      what: {
        title: 'What is this',
        text: '{name} is a mobile app with a class roadmap: warm-up, solo, partner elements and reference blocks. You can add it to your Home Screen and use it offline.',
      },
      tabs: {
        title: 'Tabs',
        program: '{label} — the program by learning stage',
        programLabel: '3 mo / 3–5 / 6+',
        search: '{label} — quick search for an element by name or section',
        elements: '{label} — the summary reference of {modules} (in the ☰ menu)',
        elementsLabel: '📑 Elements by blocks',
        modules: '{n} module | {n} modules',
      },
      checklists: {
        title: 'Checklists and progress',
        tap: 'Tap an element to mark it as done',
        untap: 'Tap again to clear the mark',
        bar: 'Above the list — the {label} for the current period',
        barLabel: 'progress bar',
        counter: 'In the section header — the {label} counter',
        counterLabel: 'done / total',
      },
      sections: {
        title: 'Sections',
        text: 'Tap a section header (Warm-up, Partner elements, etc.) to collapse or expand the list.',
      },
      search: {
        title: 'Search',
        text: 'Enter the name of a figure or a section. Tap a result — the app opens the right tab and period.',
      },
      profiles: {
        title: 'Students and groups',
        menu: 'In the {icon} menu — the list of students and groups, creation, reference and reset',
        switch: '{label} — switching, editing and deleting',
        create: '{label} — separate progress for each one',
        name: 'You choose the name — it can be a person or a group title',
        own: 'Each one has their own progress and last tab',
      },
      saving: {
        title: 'Saving',
        auto: 'Progress, the list of students and the last tab are saved automatically on the device',
        offline: 'After the first open the app works without internet',
        backup: 'A backup copy is made on every save in case the data gets corrupted',
        update: 'Updating the app {label} students and their progress',
        updateLabel: 'does not delete',
      },
      updates: {
        title: 'Updates',
        text: 'When a new version is released, the app picks it up by itself the next time you open it or return to the tab. The page may reload once — that is normal. Your data is kept.',
      },
      problems: {
        title: 'If something goes wrong',
        message: 'A short message with an explanation appears at the bottom of the screen',
        corrupted: 'If data is corrupted — the app will try to restore the last copy',
        unavailable:
          'If storage is unavailable (private mode, etc.) — progress will not be saved after a reload',
        space: 'Not enough space on the device — free up memory in the browser settings',
      },
      install: {
        title: 'Installing on iPhone',
        text: 'Open the link in {label} → Share → "Add to Home Screen". Do not open it from the Files app — the PWA does not work there.',
      },
      reset: {
        title: 'Resetting progress',
        text: 'The {icon} button in the menu clears marks only for the {label} selected student or group after confirmation.',
        labelCurrent: 'current',
      },
    },
  },
} satisfies typeof ru;
