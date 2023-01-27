/* eslint-disable no-param-reassign */

import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index.js';

/// //////////////////////////
// Текст
/// //////////////////////////

const defaultLanguage = 'ru';

const i18nextInstance = i18next.createInstance();
i18nextInstance.init({
  lng: defaultLanguage,
  debug: false,
  resources: {
    en: resources.en,
    ru: resources.ru,
  },
});

/// //////////////////////////
// Рендер ошибок
/// //////////////////////////
const renderErrors = (elements, value) => {
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');

  elements.input.classList.add('is-invalid');
  if (value === 'notValid') {
    elements.feedback.textContent = i18nextInstance.t('errors.notValid');
  }
  if (value === 'alreadyExists') {
    elements.feedback.textContent = i18nextInstance.t('errors.alreadyExists');
  }
  if (value === 'parserError') {
    elements.feedback.textContent = i18nextInstance.t('errors.parserError');
  }
  elements.form.reset();
  elements.input.focus();
};
/// //////////////////////////
// Рендер фидов
/// //////////////////////////

const renderFeeds = (elements, feeds) => {
  elements.feedsContainer.innerHTML = '';
  elements.feedback.classList.remove('text-danger');
  elements.feedback.classList.add('text-success');
  elements.input.classList.remove('is-invalid');
  elements.feedback.textContent = i18nextInstance.t('downloaded');
  elements.form.reset();
  elements.input.focus();

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nextInstance.t('containerContent.feeds');

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  feeds.forEach((feed) => {
    const listItem = document.createElement('li');
    listItem.classList.add('list-group-item', 'border-0', 'border-end-0');

    const listItemTitle = document.createElement('h3');
    listItemTitle.classList.add('h6', 'm-0');
    listItemTitle.textContent = feed.title;

    const paragraph = document.createElement('p');
    paragraph.classList.add('small', 'm-0', 'text-black-50');
    paragraph.textContent = feed.description;

    listItem.append(listItemTitle, paragraph);
    listGroup.append(listItem);
  });

  card.append(cardBody, listGroup);
  cardBody.append(cardTitle);

  elements.feedsContainer.append(card);
};

/// //////////////////////////
// Рендер постов
/// //////////////////////////

const renderPosts = (elements, posts) => {
  elements.postsContainer.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nextInstance.t('containerContent.posts');

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  posts.forEach((post) => {
    const listItem = document.createElement('li');
    listItem.classList.add(
      'list-group-item',
      'd-flex',
      'justify-content-between',
      'align-items-start',
      'border-0',
      'border-end-0',
    );

    const link = document.createElement('a');
    link.classList.add('fw-bold');
    link.setAttribute('href', post.link);
    link.setAttribute('data-id', post.id);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.postTitle;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nextInstance.t('containerContent.buttonWatch');

    listItem.append(link, button);
    listGroup.append(listItem);
  });

  card.append(cardTitle, listGroup);
  elements.postsContainer.append(card);
};

/// //////////////////////////
// Сам watcher
/// //////////////////////////

export default (state, elements) => onChange(state, (path, value) => {
  if (path === 'form.errors') {
    renderErrors(elements, value);
  }

  if (path === 'feeds') {
    renderFeeds(elements, value);
  }

  if (path === 'posts') {
    renderPosts(elements, value);
  }
});
