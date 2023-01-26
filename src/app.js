import * as yup from 'yup';
import { setLocale } from 'yup';
import i18next from 'i18next';
import viewer from './view.js';
import resources from './locales/index.js';

export default () => {
  const state = {
    form: {
      validate: true,
      errors: [],
      message: '',
    },
    feeds: [],
    posts: [],
  };

  const defaultLanguage = 'en';

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: defaultLanguage,
    debug: true,
    resources: {
      en: resources.en,
    },
  });

  setLocale({
    string: {
      url: i18nextInstance.t('errors.notValid'),
    },
    mixed: {
      notOneOf: i18nextInstance.t('errors.alreadyExists'),
    },
  });

  const form = document.querySelector('.rss-form');
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const feedsContainer = document.querySelector('.feeds');
  const postsContainer = document.querySelector('.posts');

  const elements = {
    form,
    input,
    feedback,
    feedsContainer,
    postsContainer,
  };

  const watcher = viewer(state, elements);

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const inputValue = formData.get('url');

    const schema = yup.string().required().url().notOneOf(watcher.feeds);

    schema
      .validate(inputValue)
      .then(() => {
        watcher.form.errors = [];
        watcher.feeds.push(inputValue);

        watcher.form.validate = true;
      })
      .catch((err) => {
        const [error] = err.errors;
        watcher.form.errors = error;

        watcher.form.validate = false;
      });
  });
};
