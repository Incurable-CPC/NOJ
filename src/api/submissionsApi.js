/**
 * Created by cpc on 2/26/16.
 */

import { Router } from 'express';
const router = new Router();

import { requireAuth, requireAdmin } from './common';
import Submission from '../models/submissionModel';
import Problem from '../models/problemModel';
import Contest from '../models/contestModel';
import User from '../models/userModel';
import { RESULT_VALUES } from '../constants';
import checkSubmission, { isCompleted, isAccepted } from '../check/submission';

const getSubmissionList = async (req, res, next) => {
  try {
    const { pid } = req.query;
    const cond = {};
    if (pid) cond.pid = pid;
    const submissionList = await Submission.find(cond).
      select('-code').
      sort({ sid: -1 });
    res.send({ submissionList });
  } catch (err) {
    next(err);
  }
};

const getSubmission = async (req, res, next) => {
  try {
    const { params: { sid }, cookies: { username } } = req;
    let submission = await Submission
      .findOne({ sid });
    if (username !== submission.username) {
      submission.code = null;
    }

    res.send({ submission });
  } catch (err) {
    next(err);
  }
};

const postSubmission = async (req, res, next) => {
  try {
    const {
      body: {
        submission: { pid, language, code },
        },
      cookies: { username },
      } = req;
    let submission = new Submission({ username, pid, language, code });
    const error = checkSubmission(submission);
    if (error) {
      return res.status(400).send({ error });
    }

    const problem = await Problem
      .findOne({ pid })
      .select('originOJ originPid');
    submission.originOJ = problem.originOJ;
    submission.originPid = problem.originPid;
    await submission.save();
    submission = await submission.save();
    await Problem.findOneAndUpdate(
      { pid },
      { $inc: { submit: 1 } });
    await Problem.updateRatio(pid);
    await User.findOneAndUpdate(
      { username },
      { $addToSet: { tried: pid } });
    res.send({ submission });
  } catch (err) {
    next(err);
  }
};

const getUnjudgedSubmission = async (req, res, next) => {
  try {
    const submission = await Submission
      .findOneAndUpdate(
        { result: 0 },
        { $set: { result: RESULT_VALUES.RI } },
      ).sort({ sid: 1 });
    if (submission) {
      res.send({ submission });
    } else {
      res.send({});
    }
  } catch (err) {
    next(err);
  }
};

const updateSubmissionResult = async (req, res, next) => {
  try {
    const { sid } = req.params;
    let submission = await Submission.findOne({ sid });
    if (isCompleted(submission.result)) {
      return res.send({ submission });
    }

    submission = await Submission.findOneAndUpdate(
      { sid },
      req.body.submission,
      { new: true });
    if (isAccepted(submission.result)) {
      const { username, pid } = submission;
      await Problem.findOneAndUpdate(
        { pid },
        { $inc: { accepted: 1 } });
      await Problem.updateRatio(pid);
      await User.findOneAndUpdate(
        { username },
        { $addToSet: { solved: pid } });
    }

    res.send({ submission });
  } catch (err) {
    next(err);
  }
};

router.get('/', getSubmissionList);
router.get('/:sid', getSubmission);

router.all('*', requireAuth);
router.post('/', postSubmission);

router.all('*', requireAdmin);
router.post('/unjudged', getUnjudgedSubmission);
router.patch('/:sid', updateSubmissionResult);

export default router;
