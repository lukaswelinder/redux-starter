import { App } from './../components';
import Home from './Home/Home';
import Users from './Users/Users';
import NotFound from './NotFound/NotFound';

const langPrefix = (path = '') => `/:lng/${path}`;

export default (store) => {  // eslint-disable-line
  return [{
    component: App,
    routes: [
      {
        path: langPrefix(),
        exact: true,
        component: Home
      },
      {
        path: langPrefix('users'),
        component: Users
      },
      {
        path: '*',
        component: NotFound
      }
    ]
  }];
};
