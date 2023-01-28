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
  if (value === 'AxiosError') {
    elements.feedback.textContent = i18nextInstance.t('errors.network');
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
    if (post.visited !== true) {
      link.classList.add('fw-bold');
    } else {
      link.classList.add('fw-normal', 'link-secondary');
    }

    link.setAttribute('href', post.postLink);
    link.setAttribute('data-id', post.postId);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.textContent = post.postTitle;

    const button = document.createElement('button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-id', post.postId);
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
// Рендер посещенных постов
/// //////////////////////////

const renderVisitedPosts = (posts) => {
  posts.forEach((post) => {
    const link = document.querySelector(`a[data-id="${post.postId}"]`);
    link.classList.remove('fw-bold');
    link.classList.add('fw-normal', 'link-secondary');
  });
};

/// //////////////////////////
// Рендер окон
/// //////////////////////////

const renderModal = (state, elements, currentPostId) => {
  const currentPost = state.posts.find((post) => post.postId === currentPostId);

  const modalTitle = elements.modal.querySelector('.modal-title');
  const modalBody = elements.modal.querySelector('.modal-body');
  const modalLink = elements.modal.querySelector('.full-article');
  console.log(currentPost);
  modalTitle.textContent = currentPost.postTitle;
  modalBody.textContent = currentPost.postDescription;
  modalLink.setAttribute('href', currentPost.postLink);
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

  if (path === 'visitedPosts') {
    renderVisitedPosts(value);
  }
  if (path === 'currentPostId') {
    renderModal(state, elements, value);
  }
});
