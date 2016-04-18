/**
 * Create by cpc on 2/17/16.
 **/

import React, { Component } from 'react';
import ImmutableTypes from 'react-immutable-proptypes';
import Board from './Board.jsx';
import { connect } from 'react-redux';

@connect(state => ({
  problems: state.contest.getIn(['detail', 'problems']),
  teams: state.contest.getIn(['detail', 'teams']),
}))
export default class Test extends Component {
  static propTypes = {
    problems: ImmutableTypes.list,
    teams: ImmutableTypes.map,
  };

  render() {
    const { problems, teams } = this.props;
    return (
      <div>
        <Board
          problems={problems}
          teams={teams}
        />
      </div>
    );
  }
}
