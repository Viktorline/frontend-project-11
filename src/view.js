/* eslint-disable no-param-reassign */

import onChange from 'on-change';

export default (state, elements) => onChange(state, (path, value) => {
  if (path === 'form.errors') {
    elements.feedback.classList.remove('text-success');
    elements.feedback.classList.add('text-danger');

    elements.input.classList.add('is-invalid');

    if (value === 'notValid') {
      elements.feedback.textContent = 'Ссылка должна быть валидным URL';
    }
    if (value === 'alreadyExists') {
      elements.feedback.textContent = 'RSS уже существует';
    }
    elements.form.reset();
    elements.input.focus();
  }

  if (path === 'feeds') {
    elements.feedback.classList.remove('text-danger');
    elements.feedback.classList.add('text-success');

    elements.input.classList.remove('is-invalid');

    elements.feedback.textContent = 'RSS успешно загружен';
    elements.form.reset();
    elements.input.focus();
  }
});
