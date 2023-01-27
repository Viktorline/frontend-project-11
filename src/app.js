import * as yup from 'yup';
import { setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import domParser from './domParser.js';
import viewer from './view.js';
import resources from './locales/index.js';

const hexletProxy = (link) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.set('disableCache', 'true');
  url.searchParams.set('url', link);
  return url;
};

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
    debug: false,
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

    const schema = yup
      .string()
      .required()
      .url()
      .notOneOf(watcher.feeds.map((feed) => feed.responseLink));

    schema
      .validate(inputValue)
      .then(async () => {
        try {
          const response = await axios.get(hexletProxy(inputValue));
          return response;
        } catch (err) {
          const [error] = err.errors;
          watcher.form.errors = error;
          return false;
        }
      })
      .then((response) => {
        watcher.form.errors = [];
        watcher.form.validate = true;
        const content = domParser(response.data.contents, inputValue);
        watcher.feeds.push(content.feed);
        watcher.posts = [...content.posts, ...watcher.posts];
      })
      .catch((err) => {
        const [error] = err.errors;
        watcher.form.errors = error;
        watcher.form.validate = false;
      });
  });
};
