/* eslint-disable no-param-reassign */

import onChange from 'on-change';

const renderErrors = (elements, value, i18nextInstance) => {
  elements.feedback.classList.remove('text-success');
  elements.feedback.classList.add('text-danger');
  elements.input.classList.add('is-invalid');

  switch (value) {
    case 'notValid':
      elements.feedback.textContent = i18nextInstance.t('errors.notValid');
      break;
    case 'alreadyExists':
      elements.feedback.textContent = i18nextInstance.t('errors.alreadyExists');
      break;
    case 'parserError':
      elements.feedback.textContent = i18nextInstance.t('errors.parserError');
      break;
    case 'AxiosError':
      elements.feedback.textContent = i18nextInstance.t('errors.network');
      break;
    case 'unknown':
      elements.feedback.textContent = i18nextInstance.t('errors.unknown');
      break;
    default:
      break;
  }

  elements.form.reset();
  elements.input.focus();
};

const renderFeeds = (elements, feeds, i18nextInstance) => {
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

const renderPosts = (state, elements, i18nextInstance) => {
  elements.postsContainer.innerHTML = '';

  const card = document.createElement('div');
  card.classList.add('card', 'border-0');

  const cardTitle = document.createElement('h2');
  cardTitle.classList.add('card-title', 'h4');
  cardTitle.textContent = i18nextInstance.t('containerContent.posts');

  const listGroup = document.createElement('ul');
  listGroup.classList.add('list-group', 'border-0', 'rounded-0');

  state.posts.forEach((post) => {
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

    if (state.visitedPostsId.includes(post.postId)) {
      link.classList.add('fw-normal', 'link-secondary');
    } else {
      link.classList.add('fw-bold');
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

const renderVisitedPosts = (postsIds) => {
  postsIds.forEach((postId) => {
    const link = document.querySelector(`a[data-id="${postId}"]`);
    link.classList.remove('fw-bold');
    link.classList.add('fw-normal', 'link-secondary');
  });
};

const renderModal = (state, elements) => {
  const currentPost = state.posts.find((post) => post.postId === state.currentPostId);

  const modalTitle = elements.modal.querySelector('.modal-title');
  const modalBody = elements.modal.querySelector('.modal-body');
  const modalLink = elements.modal.querySelector('.full-article');
  modalTitle.textContent = currentPost.postTitle;
  modalBody.textContent = currentPost.postDescription;
  modalLink.setAttribute('href', currentPost.postLink);
};

const buttonBlock = (value = null) => {
  const button = document.querySelector('button[type="submit"]');
  button.disabled = !!value;
};

const updateFormStatus = (elements, state, i18nextInstance, value) => {
  switch (value) {
    case 'sendingRequest':
      buttonBlock(value);
      break;
    case 'responseRecieved':
      buttonBlock();
      break;
    case 'failed':
      renderErrors(elements, state.form.errors, i18nextInstance);
      buttonBlock();
      break;
    default:
      break;
  }
};

export default (state, elements, i18nextInstance) => onChange(state, (path, value) => {
  switch (path) {
    case 'form.status':
      updateFormStatus(elements, state, i18nextInstance, value);
      break;
    case 'feeds':
      renderFeeds(elements, value, i18nextInstance);
      break;
    case 'posts':
      renderPosts(state, elements, i18nextInstance);
      break;
    case 'visitedPostsId':
      renderVisitedPosts(value);
      break;
    case 'currentPostId':
      renderModal(state, elements);
      break;
    default:
      break;
  }
});
