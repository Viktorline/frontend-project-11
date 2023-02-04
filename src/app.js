import 'bootstrap';
import * as yup from 'yup';
import { setLocale } from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import { uniqueId } from 'lodash';
import domParser from './domParser.js';
import viewer from './view.js';
import resources from './locales/index.js';

const hexletProxy = (link) => {
  const url = new URL('https://allorigins.hexlet.app/get');
  url.searchParams.set('disableCache', 'true');
  url.searchParams.set('url', link);
  return url.toString();
};

const generateId = (content) => {
  const { feed, posts } = content;
  return {
    feed,
    posts: posts.map((post) => ({ ...post, postId: uniqueId() })),
  };
};

export default () => {
  const state = {
    form: {
      valid: true,
      errors: [],
      message: '',
      status: '',
    },
    feeds: [],
    posts: [],

    visitedPostsId: [],
    currentPostId: null,
  };

  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: false,
    resources: {
      ru: resources.ru,
    },
  });

  setLocale({
    string: {
      url: 'notValid',
    },
    mixed: {
      notOneOf: 'alreadyExists',
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

  const watchedState = viewer(state, elements, i18nextInstance);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.form.status = 'sendingRequest';

    const formData = new FormData(event.target);
    const inputValue = formData.get('url');

    const schema = yup
      .string()
      .required()
      .url()
      .notOneOf(watchedState.feeds.map((feed) => feed.responseLink));

    schema
      .validate(inputValue)
      .then(() => {
        const queryString = hexletProxy(inputValue);
        const response = axios.get(queryString);
        return response;
      })
      .then((response) => {
        watchedState.form.errors = [];
        watchedState.form.valid = true;
        watchedState.form.status = 'responseRecieved';
        const content = domParser(response.data.contents, inputValue);
        const readyContent = generateId(content);
        watchedState.feeds.unshift(readyContent.feed);
        watchedState.posts = [...readyContent.posts, ...watchedState.posts];
      })
      .catch((err) => {
        if (err.name === 'AxiosError') {
          watchedState.form.errors = err.name;
        } else if (err.message === 'alreadyExists') {
          watchedState.form.errors = err.message;
        } else if (err.message === 'notValid') {
          watchedState.form.errors = err.message;
        } else {
          const [error] = err.errors;
          watchedState.form.errors = error;
        }
        watchedState.form.status = 'failed';
        watchedState.form.valid = false;
      });
  });

  const update = () => {
    const updateInterval = 5000;
    const promises = watchedState.feeds.map((feed) => {
      const promise = axios.get(hexletProxy(feed.responseLink));

      return promise
        .then((response) => {
          const content = domParser(response.data.contents);
          const { posts } = content;
          const currentPosts = watchedState.posts.map((post) => post.postLink);
          const newPosts = posts.filter((post) => !currentPosts.includes(post.postLink));

          watchedState.posts = newPosts.concat(watchedState.posts);
        })
        .catch((err) => {
          const [error] = err.errors;
          watchedState.form.errors = error;
          watchedState.form.status = 'failed';
        });
    });

    Promise.all(promises).finally(() => setTimeout(() => update(), updateInterval));
  };

  elements.postsContainer.addEventListener('click', (event) => {
    if (event.target.dataset.id) {
      const currentPost = watchedState.posts.find(
        (post) => post.postId === event.target.dataset.id,
      );
      watchedState.visitedPostsId.push(currentPost.postId);
      watchedState.currentPostId = currentPost.postId;
    }
  });

  update();
};
