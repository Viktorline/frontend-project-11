import * as yup from 'yup';
import viewer from './view.js';

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

    const schema = yup.string().required().url('notValid').notOneOf(watcher.feeds, 'alreadyExists');

    schema
      .validate(inputValue)
      .then(() => {
        watcher.form.errors = [];
        watcher.feeds.push(inputValue);

        watcher.form.validate = true;
      })
      .catch((e) => {
        const [error] = e.errors;
        watcher.form.errors = error;

        watcher.form.validate = false;
      });
  });
};
