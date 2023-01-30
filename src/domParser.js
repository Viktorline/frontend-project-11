import { uniqueId } from 'lodash';

export default (response, responseLink = null) => {
  const parser = new DOMParser();
  const content = parser.parseFromString(response, 'application/xml');

  if (content.querySelector('parsererror')) {
    const error = new Error();
    error.errors = ['parserError'];
    throw error;
  }

  const title = content.querySelector('title').textContent;
  const description = content.querySelector('description').textContent;

  const items = content.querySelectorAll('item');
  const posts = [];
  items.forEach((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postDescription = post.querySelector('description').textContent;
    const postLink = post.querySelector('link').textContent;
    posts.push({
      postTitle,
      postDescription,
      postLink,
      visited: false,
    });
  });
  return { feed: { title, responseLink, description }, posts };
};
