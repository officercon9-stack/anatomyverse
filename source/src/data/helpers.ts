// @ts-nocheck

export var PENDING_REVIEW = 'pending-expert-review';

export var options = (...e) =>
  e.map((e, t) => ({
    id: String.fromCharCode(97 + t),
    text: e,
  }));
