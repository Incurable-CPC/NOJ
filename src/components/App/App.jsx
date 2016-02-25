/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React, { Component, PropTypes, createFactory } from 'react';
import ImmutableTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import s from './App.scss';
import Header from '../Header';
import { showDialog, hideDialog } from '../../actions/DialogActions';
import { login, register, logout } from '../../actions/AuthActions';

import { ToastContainer, ToastMessage } from 'react-toastr';
const ToastMessageFactory = createFactory(ToastMessage.animation);
import { setContainer } from '../../core/toast';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const context = {
  insertCss: styles => styles._insertCss(),
  onSetTitle: value => document.title = value,
  onSetMeta: (name, content) => {
    // Remove and create a new <meta /> tag in order to make it work
    // with bookmarks in Safari
    const elements = document.getElementsByTagName('meta');
    [].slice.call(elements).forEach((element) => {
      if (element.getAttribute('name') === name) {
        element.parentNode.removeChild(element);
      }
    });
    const meta = document.createElement('meta');
    meta.setAttribute('name', name);
    meta.setAttribute('content', content);
    document.getElementsByTagName('head')[0].appendChild(meta);
  },
};

@connect(state => state)
export default class App extends Component {
  static propTypes = {
    children: PropTypes.element.isRequired,
    dialog: PropTypes.string.isRequired,
    auth: ImmutableTypes.map,
    location: PropTypes.object,
    dispatch: PropTypes.func.isRequired,
  };
  static childContextTypes = {
    insertCss: PropTypes.func.isRequired,
    onSetTitle: PropTypes.func.isRequired,
    onSetMeta: PropTypes.func.isRequired,
  };

  getChildContext() {
    return context;
  }

  componentDidMount() {
    this.removeCss = context.insertCss(s);
  }

  componentWillUnmount() {
    this.removeCss();
  }

  render() {
    const { dialog, location, dispatch, auth } = this.props;
    const match = location.pathname.match(/\/([^\/]*)/);
    const active = (match) ? match[1] : 'empty';
    return (
      <div>
        <Header
          auth={auth}
          dialog={dialog}
          active={active}
          login={() => dispatch(login())}
          logout={() => dispatch(logout())}
          register={() => dispatch(register())}
          showDialog={(_) => dispatch(showDialog(_))}
          hideDialog={() => dispatch(hideDialog())}
        />
        {this.props.children}
        <ToastContainer
          ref={setContainer}
          toastMessageFactory={ToastMessageFactory}
          className="toast-top-right"
        />
      </div>
    );
  }
}
