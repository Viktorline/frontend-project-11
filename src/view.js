/* eslint-disable no-param-reassign */

import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index.js';

const defaultLanguage = 'ru';

const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: defaultLanguage,
  debug: true,
  resources: {
    en: resources.en,
    ru: resources.ru,
  },
});

export default (state, elements) => onChange(state, (path, value) => {
  if (path === 'form.errors') {
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-danger');

    elements.input.classList.add('is-invalid');
    console.log(value);
    if (value === 'notValid') {
      elements.feedback.textContent = i18nextInstance.t('errors.notValid');
    }
    if (value === 'alreadyExists') {
      elements.feedback.textContent = i18nextInstance.t('errors.alreadyExists');
    }
    elements.form.reset();
    elements.input.focus();
  }

  if (path === 'feeds') {
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');

    elements.input.classList.remove('is-invalid');

    elements.feedback.textContent = i18nextInstance.t('downloaded');
    elements.form.reset();
    elements.input.focus();
  }
});
