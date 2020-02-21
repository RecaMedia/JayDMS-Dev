import { applyMiddleware, createStore, combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import asyncDispatch from './asyncDispatch';

import global from '../reducers/global';
import portal from '../reducers/portal';

const reducers = combineReducers({
  global,
  portal,
  routing: routerReducer
});

const middleware = applyMiddleware(asyncDispatch);

export default createStore(reducers, middleware);