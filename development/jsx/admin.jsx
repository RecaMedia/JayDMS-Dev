import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { withRouter, Route } from 'react-router';
import { Router, Switch } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as actionCreators from './actions/index';

import PreWrapper from './utilities/wrapper';
import History from './utilities/history';

import Dashboard from './templates/dashboard';
import Posts from './templates/posts';
import PostsEditor from './templates/posts-editor';
import StashEditor from './templates/stash-editor';
import DevFieldTypes from './templates/developer-fieldtypes';
import DevComponents from './templates/developer-components';
import DevComponentsEditor from './templates/developer-components-editor';
import DevTemplates from './templates/developer-templates';
import DevTemplatesEditor from './templates/developer-templates-editor';
import DevPostTypes from './templates/developer-posttypes';
import DevPostTypesEditor from './templates/developer-posttypes-editor';
import DevStashes from './templates/developer-stashes';
import DevStashEditor from './templates/developer-stash-editor';
import GloMenuManager from './templates/menu-manager';
import GloSettings from './templates/settings';
import GloFrontEnd from './templates/front-end';
import GloFileManagerView from './templates/file-manager';
import UserAdd from './templates/user-add';
import UserProfile from './templates/user-profile';
import Users from './templates/users';

import store from './utilities/store';

function mapStateToProps(state) {
	return {
		global: state.global
	}
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators(actionCreators, dispatch);
}

const admin_path = "/cp";
const route_params = {
  basename: admin_path,
  history: History,
  store
}
const Wrapper = withRouter(connect(mapStateToProps, mapDispatchToProps)(PreWrapper));

const Render = <Provider store={store}>
  <Router history={History} basename={admin_path}>
    <Wrapper basename={admin_path}>
      <Switch>
        <Route exact path={admin_path + "/"} render={(props) => (
          <Dashboard {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/developer/fieldtypes"} render={(props) => (
          <DevFieldTypes {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/developer/components"} render={(props) => (
          <DevComponents {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/developer/components/:mode"} render={(props) => (
          <DevComponentsEditor {...route_params} {...props} />
        )} />
        <Route path={admin_path + "/developer/components/:mode/:slug"} render={(props) => (
          <DevComponentsEditor {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/developer/templates"} render={(props) => (
          <DevTemplates {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/developer/templates/:mode"} render={(props) => (
          <DevTemplatesEditor {...route_params} {...props} />
        )} />
        <Route path={admin_path + "/developer/templates/:mode/:slug"} render={(props) => (
          <DevTemplatesEditor {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/pt/:posttype"} render={(props) => (
          <Posts {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/pt/:posttype/add"} render={(props) => (
          <PostsEditor {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/pt/:posttype/edit/:slug"} render={(props) => (
          <PostsEditor {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/developer/posttypes"} render={(props) => (
          <DevPostTypes {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/developer/posttypes/:mode"} render={(props) => (
          <DevPostTypesEditor {...route_params} {...props} />
        )} />
        <Route path={admin_path + "/developer/posttypes/:mode/:slug"} render={(props) => (
          <DevPostTypesEditor {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/stash/:stashSlug"} render={(props) => (
          <StashEditor {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/developer/stashes"} render={(props) => (
          <DevStashes {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/developer/stashes/:mode"} render={(props) => (
          <DevStashEditor {...route_params} {...props} />
        )} />
        <Route path={admin_path + "/developer/stashes/:mode/:stashSlug"} render={(props) => (
          <DevStashEditor {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/global/menu-manager"} render={(props) => (
          <GloMenuManager {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/global/menu-manager/edit/:menuSlug"} render={(props) => (
          <GloMenuManager {...route_params} {...props} />
        )} />
        <Route path={admin_path + "/global/settings"} render={(props) => (
          <GloSettings {...route_params} {...props} />
        )} />
        <Route path={admin_path + "/global/front-end"} render={(props) => (
          <GloFrontEnd {...route_params} {...props} />
        )} />
        <Route path={admin_path + "/global/file-manager"} render={(props) => (
          <GloFileManagerView {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/users"} render={(props) => (
          <Users {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/users/add"} render={(props) => (
          <UserAdd {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/users/edit/me"} render={(props) => (
          <UserProfile {...route_params} {...props} />
        )} />
        <Route exact path={admin_path + "/users/edit/:username"} render={(props) => (
          <UserProfile {...route_params} {...props} />
        )} />
      </Switch>
    </Wrapper>
  </Router>
</Provider>;

ReactDOM.render(Render, document.getElementById('AdminUI'));