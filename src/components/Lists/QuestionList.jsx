/**
 * Create by cpc on 5/15/16.
 **/

import React, { Component, PropTypes } from 'react';
import ImmutableTypes from 'react-immutable-proptypes';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';
import { grey50, grey500 } from 'material-ui/styles/colors';
import moment from 'moment';

import ClarificationForm from '../Forms/ClarificationForm.jsx';

const styles = {
  content: {
    padding: '12px 20px',
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: grey50,
    // borderRadius: 10,
  },
  info: {
    paddingTop: 8,
    fontSize: 12,
    color: grey500,
    // textAlign: 'right',
  },
  marginTop: { paddingTop: 20 },
};

const multiLines = (str) => {
  const lines = (str || '')
    .split('\n')
    .map((line, index) => <span key={index}>{line}<br/></span>);
  return <span>{lines}</span>;
};

class Question extends Component {
  static propTypes = {
    isManager: PropTypes.bool.isRequired,
    question: ImmutableTypes.map.isRequired,
  };

  render() {
    const { question, isManager } = this.props;
    const answers = question.get('answers');
    const answerNodeList = answers && answers.map((answer, index) => {
      return (
        <div key={index} style={index > 0 ? styles.marginTop : {}}>
          {multiLines(answer.get('content'))}
          <div style={styles.info}>
            from {answer.get('username')}
            , {moment(answer.get('time')).format('YYYY-MM-DD hh:mm:ss')}
          </div>
        </div>
      );
    });
    const { username, time, qid } = question.toJS();
    return (
      <div style={{ paddingTop: 20, paddingBottom: 20 }}>
        <div style={{ paddingBottom: 4 }}>
          <strong>Question:</strong>
          <Paper style={styles.content}>
            {multiLines(question.get('content'))}
            <div style={styles.info}>
              from {username}, {moment(time).format('YYYY-MM-DD hh:mm:ss')}
            </div>
          </Paper>
        </div>
        <div>
          <strong>Answer(s):</strong>
          <Paper style={styles.content}>
            {answerNodeList}
            {isManager && <ClarificationForm formKey={qid.toString()} />}
          </Paper>
        </div>
      </div>
    );
  }
}

export default class QuestionList extends Component {
  static propTypes = {
    isManager: PropTypes.bool.isRequired,
    questionList: ImmutableTypes.list,
  };

  render() {
    const { questionList, isManager } = this.props;
    const questionNodeList =
      questionList && questionList.reverse().map((question, index) =>
        <div key={index}>
          {(index > 0) && <Divider /> }
          <Question isManager={isManager} question={question} />
        </div>);
    return (
      <div>
        {questionNodeList}
      </div>
    );
  }
}