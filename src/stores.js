/**
 * Created by cpc on 1/29/16.
 */

import { createStore, combineReducers, applyMiddleware, compose } from 'redux';
import { syncHistory, routeReducer } from 'react-router-redux';
import { browserHistory } from 'react-router';
import { reducer as formReducer } from 'redux-form';
import thunk from 'redux-thunk';
import moment from 'moment';

import dialogReducer from './reducers/DialogReducer';
import authReducer from './reducers/AuthReducer';
import problemReducer from './reducers/ProblemReducer';
import submissionReducer from './reducers/SubmissionReducer';
import contestReducer from './reducers/ContestReducer';
import timeReducer from './reducers/TimeReducer';

const reducer = combineReducers({
  routing: routeReducer,
  dialog: dialogReducer,
  auth: authReducer,
  form: formReducer,
  problem: problemReducer,
  contest: contestReducer,
  submission: submissionReducer,
  time: timeReducer,
});

// Sync dispatched route actions to the history
const reduxRouterMiddleware = syncHistory(browserHistory);
const createStoreWithMiddleware = compose(
  applyMiddleware(thunk),
  applyMiddleware(reduxRouterMiddleware),
  window.devToolsExtension ? window.devToolsExtension() : f => f
)(createStore);

const store = createStoreWithMiddleware(reducer);
reduxRouterMiddleware.listenForReplays(store);

export default store;
