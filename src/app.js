import 'bootstrap';
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
    visitedPosts: [],
    currentPostId: '',
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
  const modal = document.querySelector('#modal');

  const elements = {
    form,
    input,
    feedback,
    feedsContainer,
    postsContainer,
    modal,
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
      .then(() => {
        const response = axios.get(hexletProxy(inputValue));
        return response;
      })
      .then((response) => {
        watcher.form.errors = [];
        watcher.form.validate = true;
        const content = domParser(response.data.contents, inputValue);
        watcher.feeds.unshift(content.feed);
        watcher.posts = [...content.posts, ...watcher.posts];
      })
      .catch((err) => {
        if (err.name === 'AxiosError') {
          watcher.form.errors = err.name;
        } else if (err.message === 'alreadyExists') {
          watcher.form.errors = err.message;
        } else if (err.message === 'notValid') {
          watcher.form.errors = err.message;
        } else {
          const [error] = err.errors;
          watcher.form.errors = error;
        }
        watcher.form.validate = false;
      });
  });

  const updater = () => {
    const promises = watcher.feeds.map((feed) => {
      const promise = axios.get(hexletProxy(feed.responseLink));

      return promise.then((response) => {
        const content = domParser(response.data.contents);
        const { posts } = content;
        const currentPosts = watcher.posts.map((post) => post.postLink);
        const newPosts = posts.filter((post) => !currentPosts.includes(post.postLink));

        watcher.posts = newPosts.concat(watcher.posts);
      });
    });

    Promise.all(promises).finally(() => setTimeout(() => updater(watcher), 5000));
  };

  elements.postsContainer.addEventListener('click', (event) => {
    if (event.target.dataset.id) {
      const currentPost = watcher.posts.find((post) => post.postId === event.target.dataset.id);
      currentPost.visited = true;
      watcher.visitedPosts.push(currentPost);
      watcher.currentPostId = event.target.dataset.id;
    } else if (event.target.classList.contains('list-group-item')) {
      const currentPost = watcher.posts.find(
        (post) => post.postId === event.target.firstChild.dataset.id,
      );
      currentPost.visited = true;
      watcher.visitedPosts.push(currentPost);
      window.open(event.target.firstChild.href);
    }
  });

  updater();
};
