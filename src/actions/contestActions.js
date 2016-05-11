/**
 * Created by cpc on 3/27/16.
 */


import { getJSON, postJSON } from '../core/fetchJSON';
import { is, fromJS } from 'immutable';
import toast from '../core/toast';
import nprogress from '../core/nprogress';
import Location from '../core/Location';
import checkContest from '../check/contest';
import ContestConstants from '../constants/ContestConstants';
import { isCompileError } from '../check/submission';


const setContest = (contest) => ({
  type: ContestConstants.SET,
  contest,
});

const setContestList = (condition, count, list) => ({
  type: ContestConstants.SET_LIST,
  condition,
  count,
  list,
});

export const setContestPid = (pid) => ({
  type: ContestConstants.SET_PID,
  pid,
});

export const initContest = () => ({ type: ContestConstants.INIT });

export const getContest = (cid) => async (dispatch, getState) => {
  try {
    const state = getState();
    if (state.contest.getIn(['detail', 'cid']) === cid) return true;
    nprogress.start();
    const res = await getJSON(`/api/contests/${cid}`);
    const { contest } = await res.json();
    dispatch(setContest(contest));
    await nprogress.done();
    return true;
  } catch (err) {
    Location.push('/');
    toast('error', err.message);
    await nprogress.done();
    return false;
  }
};

export const postContest = async (contest, dispatch) => {
  try {
    const error = checkContest(contest);
    if (error) {
      toast('warning', error);
      return;
    }

    nprogress.start();
    const action = contest.cid ? 'saved' : 'added';
    const res = await postJSON('/api/contests', { contest });
    const data = await res.json();
    dispatch(setContest(data.contest));
    toast('success', `Contest ${action}`);
    Location.push(`/contests/${data.contest.cid}`);
  } catch (err) {
    toast('error', err.message);
  }

  await nprogress.done();
};

export const getContestList = (condition) => async (dispatch, getState) => {
  try {
    // const state = getState();
    // const oldCondition = state.contest.get('condition');
    // if (is(oldCondition, fromJS(condition))) return true;
    nprogress.start();
    const res = await getJSON(`/api/contests`, condition);
    const { contestList, count } = await res.json();
    dispatch(setContestList(condition, count, contestList));
    await nprogress.done();
    return true;
  } catch (err) {
    toast('error', err.message);
    await nprogress.done();
    return false;
  }
};

export const getContestListByPage = (page) => async(dispatch, getState) => {
  const state = getState();
  const condition = state.contest.get('condition').toJS();
  condition.page = Number(page) || 1;
  return await dispatch(getContestList(condition));
};

export const getContestListSortBy = (sortKey) => async(dispatch, getState) => {
  const state = getState();
  const condition = state.contest.get('condition').toJS();
  condition.page = 1;
  if (sortKey === condition.sortKey) {
    condition.order = -condition.order;
  } else {
    condition.sortKey = sortKey;
    condition.order = 1;
  }

  return await dispatch(getContestList(condition));
};

export const getContestListByKeyword = (searchKey) => async(dispatch, getState) => {
  const state = getState();
  const condition = state.contest.get('condition').toJS();
  condition.page = 1;
  condition.searchKey = searchKey;
  return await dispatch(getContestList(condition));
};

export const reciveContestSubmission = (index, submission) => ({
  type: ContestConstants.SET_SUBMISSION,
  index,
  submission,
});

export const changeContestSubmissionState = (index, content) => ({
  type: ContestConstants.CHANGE_SUBMISSION_EXPAND_STATE,
  index,
  content,
});

function canContestSubmissionExpand(state, index) {
  const { contest, auth } = state;
  const username = contest.getIn(['detail', 'submissions', index, 'username']);
  return (username === auth.get('username'));
}

export const getContestSubmission = (index) => async(dispatch, getState) => {
  try {
    const state = getState();
    if (!canContestSubmissionExpand(state, index)) return true;
    nprogress.start();
    const cid = state.contest.getIn(['detail', 'cid']);
    const sid = state.contest.getIn(['detail', 'submissions', index, 'sid']);
    const res = await getJSON(`/api/contests/${cid}/submissions/${sid}`);
    const { submission } = await res.json();
    dispatch(reciveContestSubmission(index, submission));
    await nprogress.done();
    return true;
  } catch (err) {
    toast('error', err.message);
    await nprogress.done();
    return false;
  }
};

export const expandContestSubmission = (index, content) => async (dispatch, getState) => {
  try {
    const state = getState();
    const submission = state.contest.getIn(['detail', 'submissions', index]);
    if (content === 'code') {
      if (!canContestSubmissionExpand(state, index)) return;
      if (!submission.has('code')) {
        await dispatch(getContestSubmission(index));
      }
    } else if (content === 'CEInfo') {
      const result = submission.get('result');
      if (!isCompileError((result))) return;
    }

    dispatch(changeContestSubmissionState(index, content));
  } catch (err) {
    toast('error', err.message);
  }
};