import { fromJS } from 'immutable';

const initialState = {
  lang: {},
  langs: [],
};

const initialImmutableState = fromJS(initialState);

export default function reducer(state = initialImmutableState, action = {}) {
  switch (action.type) {
    default:
      return state;
  }
}
