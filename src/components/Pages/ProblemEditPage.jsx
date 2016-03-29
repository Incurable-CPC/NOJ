/**
 * Create by cpc on 1/13/16.
 **/

import React, { Component, PropTypes } from 'react';
import Paper from 'material-ui/lib/paper';

import s from './common.scss';
import withTitle from '../../decorators/withTitle';
import withStyles from '../../decorators/withStyles';
import ContestEditForm from '../Forms/ContestEditForm.jsx';

@withTitle('NOJ - Problems')
@withStyles(s)
export default class ProblemEditPage extends Component {
  static propTypes = {
    params: PropTypes.object,
  };

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { params: { pid } } = this.props;
    const action = pid ? 'save' : 'add';

    return (
      <div className={s.div}>
        <div className={s.left}>
          <Paper className={s.paper}>
            <ContestEditForm action={action} />
          </Paper>
        </div>
        <div className={s.right}>
          <Paper className={s.paper} style={{ height: 250 }}>
            TEST
          </Paper>
        </div>
      </div>
    );
  }
}
