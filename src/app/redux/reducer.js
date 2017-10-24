import { reducer as form } from 'redux-form/immutable';
import { combineReducers } from 'redux-immutablejs';
import { routerReducer as router } from 'react-router-redux';

import auth from './modules/auth';
import internationalization from './modules/internationalization';
import records, { createRecordsReducer } from './modules/records';

export default function createReducer() {
  return combineReducers({
    form,
    router,
    auth,
    internationalization,
    users: createRecordsReducer(records, 'users')
  });
}
