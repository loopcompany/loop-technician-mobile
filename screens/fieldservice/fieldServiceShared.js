// Field-service daily report of an organization order: enums, validation and
// the read helpers for what GET /technician/orders/{order}/field-service
// returns (docs/Backend-Field-Service-Daily-Report.md).

// ---------------------------------------------------------------------------
// Enums (values are sent to the server as-is; labels are i18n keys)
// ---------------------------------------------------------------------------

export const SITE_CONDITIONS = [
  { value: 'normal', label: 'Normal' },
  { value: 'problem', label: 'Has a problem' },
  { value: 'broken', label: 'Broken' },
  { value: 'needs_inspection', label: 'Needs inspection' },
];

// `problem_description` is required for these conditions.
export const CONDITIONS_REQUIRING_DESCRIPTION = ['problem', 'broken'];

export const PHOTO_KINDS = [
  { value: 'before', label: 'Before work' },
  { value: 'after', label: 'After work' },
  { value: 'problem', label: 'Problem' },
  { value: 'part', label: 'Part' },
  { value: 'other', label: 'Other' },
];

export const CONTINUATION_OWNERS = [
  { value: 'same_technician', label: 'Same technician' },
  { value: 'next_technician', label: 'Next technician' },
  { value: 'support', label: 'Support' },
  { value: 'organization', label: 'Organization' },
  { value: 'waiting_for_part', label: 'Waiting for part' },
];

export const OUTCOMES = [
  { value: 'completed', label: 'Work completed' },
  { value: 'revisit_required', label: 'Revisit required' },
  { value: 'waiting_for_part', label: 'Waiting for part' },
  { value: 'waiting_for_organization', label: 'Waiting for organization' },
  { value: 'needs_inspection', label: 'Needs inspection' },
];

// `completed` is only valid when nothing is left to do.
export const OUTCOMES_WITH_REMAINING_WORK = OUTCOMES.filter((o) => o.value !== 'completed');

export const WORK_STATUSES = {
  awaiting_visit: { label: 'Awaiting visit', tone: 'neutral', icon: 'time-outline' },
  in_progress: { label: 'Visit in progress', tone: 'active', icon: 'walk-outline' },
  awaiting_approval: { label: 'Awaiting organization approval', tone: 'warning', icon: 'hourglass-outline' },
  changes_requested: { label: 'Changes requested', tone: 'danger', icon: 'create-outline' },
  follow_up_required: { label: 'Follow-up required', tone: 'warning', icon: 'repeat-outline' },
  completed: { label: 'Work completed', tone: 'success', icon: 'checkmark-done-outline' },
};

const VISIT_STATUSES = {
  submitted: { label: 'Awaiting organization review', tone: 'warning' },
  changes_requested: { label: 'Changes requested', tone: 'danger' },
  approved: { label: 'Approved', tone: 'success' },
};

export const LIMITS = {
  MAX_ACTIONS: 20,
  ACTION_MAX_LENGTH: 255,
  TEXT_MAX_LENGTH: 2000,
  MAX_PHOTOS: 12,
  MAX_PHOTO_BYTES: 5 * 1024 * 1024,
};

export const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const labelOf = (options, value) => options.find((o) => o.value === value)?.label;

// ---------------------------------------------------------------------------
// Reading the report
// ---------------------------------------------------------------------------

const present = (value) => value !== undefined && value !== null && value !== '';
const firstPresent = (...values) => values.find(present);

const toTime = (value) => {
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(time) ? null : time;
};

export const visitStatus = (visit) => visit?.status ?? null;

export const visitStatusInfo = (visit) => {
  const status = visitStatus(visit);
  return VISIT_STATUSES[status] ?? { label: 'In progress', tone: 'active' };
};

export const workStatusInfo = (status) => WORK_STATUSES[status] ?? null;

// A report waiting for the organization (or already approved) is locked.
const LOCKED_VISIT_STATUSES = new Set(['submitted', 'approved']);
const isVisitOpen = (visit) => Boolean(visit) && !LOCKED_VISIT_STATUSES.has(visitStatus(visit));

/** Visits newest first (the technician endpoint does not promise an order). */
export const sortVisits = (visits) => (Array.isArray(visits) ? visits : [])
  .filter(Boolean)
  .slice()
  .sort((a, b) => {
    const byTime = (toTime(arrivedAt(b)) ?? 0) - (toTime(arrivedAt(a)) ?? 0);
    return byTime !== 0 ? byTime : Number(b.id ?? 0) - Number(a.id ?? 0);
  });

/**
 * The visit the technician is filling in: the one in progress, or the one the
 * organization sent back for changes. Only one may be open per order.
 */
export const findEditableVisit = (report, sortedVisits) => {
  const status = report?.work_status;
  if (present(status) && status !== 'in_progress' && status !== 'changes_requested') return null;
  return sortedVisits.find(isVisitOpen) ?? null;
};

/** A new visit may start when no report is open or waiting for review. */
export const canStartVisit = (report, sortedVisits) => {
  const status = report?.work_status;
  if (present(status)) return status === 'awaiting_visit' || status === 'follow_up_required';
  return !sortedVisits.some((visit) => visitStatus(visit) !== 'approved');
};

export const arrivedAt = (visit) => firstPresent(visit?.arrived_at, visit?.started_at, visit?.check_in_at);
export const leftAt = (visit) => firstPresent(visit?.left_at, visit?.finished_at, visit?.check_out_at);

/** Presence in minutes as computed by the server (falls back to the timestamps). */
export const durationMinutes = (visit) => {
  const minutes = Number(firstPresent(visit?.duration_minutes, visit?.presence_minutes));
  if (Number.isFinite(minutes)) return minutes;
  const start = toTime(arrivedAt(visit));
  const end = toTime(leftAt(visit));
  return start !== null && end !== null && end >= start ? Math.round((end - start) / 60000) : null;
};

export const formatDuration = (minutes, t) => {
  if (minutes === null || minutes === undefined) return '—';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours === 0) return t('{{m}} min', { m: rest });
  if (rest === 0) return t('{{h}} h', { h: hours });
  return t('{{h}} h {{m}} min', { h: hours, m: rest });
};

export const visitPhotos = (visit) => (Array.isArray(visit?.photos) ? visit.photos.filter(Boolean) : []);

export const visitActions = (visit) => (Array.isArray(visit?.actions) ? visit.actions : [])
  .map((action) => (typeof action === 'string' ? action : action?.text ?? action?.description ?? ''))
  .filter((action) => String(action).trim() !== '');

/** The organization's review history of a visit, oldest first. */
export const visitReviews = (visit) => {
  const reviews = firstPresent(visit?.reviews, visit?.review_history);
  if (!Array.isArray(reviews)) return [];
  return reviews
    .filter(Boolean)
    .slice()
    .sort((a, b) => (toTime(reviewedAt(a)) ?? 0) - (toTime(reviewedAt(b)) ?? 0));
};

export const reviewedAt = (review) => firstPresent(review?.reviewed_at, review?.created_at);

/** The note of the latest "request changes", shown above the form. */
export const latestChangeRequest = (visit) => {
  const requests = visitReviews(visit).filter((review) => review.decision === 'request_changes');
  return requests.length > 0 ? requests[requests.length - 1] : null;
};

export const hasRemainingWork = (visit) => visit?.has_remaining_work === true
  || visit?.has_remaining_work === 1
  || visit?.has_remaining_work === '1';

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

export const emptyForm = () => ({
  site_condition: null,
  problem_description: '',
  actions: [''],
  has_remaining_work: false,
  remaining_action: '',
  continuation_owner: null,
  continuation_note: '',
  outcome: null,
});

/** Pre-fills the form from a visit (resumed, or sent back for changes). */
export const formFromVisit = (visit) => {
  const actions = visitActions(visit);
  const remaining = hasRemainingWork(visit);
  return {
    site_condition: visit?.site_condition ?? null,
    problem_description: visit?.problem_description ?? '',
    actions: actions.length > 0 ? actions.slice(0, LIMITS.MAX_ACTIONS) : [''],
    has_remaining_work: remaining,
    remaining_action: visit?.remaining_action ?? '',
    continuation_owner: visit?.continuation_owner ?? null,
    continuation_note: visit?.continuation_note ?? '',
    outcome: remaining && visit?.outcome !== 'completed' ? visit?.outcome ?? null : null,
  };
};

/** Restores a locally saved draft, ignoring anything malformed. */
export const formFromDraft = (draft) => {
  if (!draft || typeof draft !== 'object') return null;
  const base = emptyForm();
  const actions = Array.isArray(draft.actions) ? draft.actions.filter((a) => typeof a === 'string') : [];
  return {
    ...base,
    site_condition: labelOf(SITE_CONDITIONS, draft.site_condition) ? draft.site_condition : null,
    problem_description: typeof draft.problem_description === 'string' ? draft.problem_description : '',
    actions: actions.length > 0 ? actions.slice(0, LIMITS.MAX_ACTIONS) : base.actions,
    has_remaining_work: draft.has_remaining_work === true,
    remaining_action: typeof draft.remaining_action === 'string' ? draft.remaining_action : '',
    continuation_owner: labelOf(CONTINUATION_OWNERS, draft.continuation_owner) ? draft.continuation_owner : null,
    continuation_note: typeof draft.continuation_note === 'string' ? draft.continuation_note : '',
    outcome: labelOf(OUTCOMES_WITH_REMAINING_WORK, draft.outcome) ? draft.outcome : null,
  };
};

export const requiresDescription = (form) => CONDITIONS_REQUIRING_DESCRIPTION.includes(form.site_condition);

/** Client-side checks mirroring the server rules. Returns { field: message }. */
export const validateForm = (form, t) => {
  const errors = {};
  if (!form.site_condition) errors.site_condition = t('Select the site condition.');
  if (requiresDescription(form) && !form.problem_description.trim()) {
    errors.problem_description = t('Describe the problem.');
  }

  const actions = form.actions.map((action) => action.trim()).filter(Boolean);
  if (actions.length === 0) errors.actions = t('Enter at least one action taken.');
  else if (actions.length > LIMITS.MAX_ACTIONS) errors.actions = t('At most {{n}} actions can be entered.', { n: LIMITS.MAX_ACTIONS });

  if (form.has_remaining_work) {
    if (!form.remaining_action.trim()) errors.remaining_action = t('Enter the remaining action.');
    if (!form.continuation_owner) errors.continuation_owner = t('Select who continues the work.');
    if (!form.outcome) errors.outcome = t('Select the visit outcome.');
  }
  return errors;
};

/** The PUT body. Fields that do not apply are left out. */
export const buildPayload = (form) => {
  const payload = {
    site_condition: form.site_condition,
    actions: form.actions.map((action) => action.trim()).filter(Boolean),
    has_remaining_work: form.has_remaining_work,
  };
  const description = form.problem_description.trim();
  if (description) payload.problem_description = description;

  if (form.has_remaining_work) {
    payload.remaining_action = form.remaining_action.trim();
    payload.continuation_owner = form.continuation_owner;
    const note = form.continuation_note.trim();
    if (note) payload.continuation_note = note;
    payload.outcome = form.outcome;
  } else {
    payload.outcome = 'completed';
  }
  return payload;
};

/** Server 422 `errors` → { field: firstMessage }; `actions.3` stays as-is. */
export const flattenServerErrors = (errors) => {
  if (!errors || typeof errors !== 'object') return {};
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => [key, Array.isArray(messages) ? messages[0] : String(messages)])
  );
};

export const draftKey = (orderId, visitId) => `field_service_draft_${orderId}_${visitId}`;

// ---------------------------------------------------------------------------
// Photos
// ---------------------------------------------------------------------------

const EXTENSION_TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };

/** Normalizes an image-picker asset and checks the server limits. */
export const preparePhoto = (asset, t) => {
  const source = asset?.fileName || asset?.file?.name || asset?.uri || '';
  const extension = String(source).split('?')[0].split('.').pop()?.toLowerCase();
  const mimeType = (asset?.mimeType || asset?.file?.type || EXTENSION_TYPES[extension] || '').toLowerCase();

  if (!ALLOWED_PHOTO_TYPES.includes(mimeType)) {
    return { error: t('Only JPEG, PNG or WebP photos can be uploaded.') };
  }
  const size = asset?.fileSize ?? asset?.file?.size;
  if (Number.isFinite(size) && size > LIMITS.MAX_PHOTO_BYTES) {
    return { error: t('The photo must be smaller than 5 MB.') };
  }

  const ext = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  const baseName = asset?.fileName || asset?.file?.name;
  return {
    photo: {
      uri: asset.uri,
      file: asset.file,
      mimeType,
      fileName: baseName && /\.[a-z0-9]+$/i.test(baseName) ? baseName : `photo_${Date.now()}.${ext}`,
    },
  };
};
