// ============================================================
// WADE STRONG — SLACK NOTIFICATIONS
// Deploy as a Netlify Function
// File path: netlify/functions/slack-notifications.js
// ============================================================

// Webhook URLs stored as Netlify environment variables — never hardcode these
const SLACK_WEBHOOKS = {
  all_money:      process.env.SLACK_ALL_MONEY,
  new_athlete:    process.env.SLACK_NEW_ATHLETE,
  new_get_strong: process.env.SLACK_NEW_GET_STRONG,
  new_custom:     process.env.SLACK_NEW_CUSTOM,
};

async function sendSlack(webhook, message) {
  const res = await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
  return res.ok;
}

const aest = () => new Date().toLocaleString('en-AU', { timeZone: 'Australia/Brisbane' }) + ' AEST';

// ── MESSAGE BUILDERS ──────────────────────────────────────────

function moneyMessage({ name, email, program, amount }) {
  const emoji = program === 'pre_comp' ? '🥇' : program === 'get_strong' ? '💪' : '✈️';
  return {
    text: `💰 New payment — A$${amount} from ${name}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: '💰 All Money All Day' } },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Client:*\n${name}` },
          { type: 'mrkdwn', text: `*Amount:*\nA$${amount}` },
          { type: 'mrkdwn', text: `*Program:*\n${emoji} ${program.replace('_',' ')}` },
          { type: 'mrkdwn', text: `*Email:*\n${email}` },
        ]
      },
      { type: 'divider' },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `⏰ ${aest()}` }] }
    ]
  };
}

function getStrongMessage({ name, email, age, location, occupation, goals, trainingAge, injuries, gymType, trainingDays }) {
  return {
    text: `🏋️ New Get Strong client — ${name} just submitted their questionnaire!`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: '🏋️ New Get Strong Client' } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${name}* just completed their questionnaire and is ready for RPE testing.` }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${name}` },
          { type: 'mrkdwn', text: `*Age:*\n${age || '—'}` },
          { type: 'mrkdwn', text: `*Location:*\n${location || '—'}` },
          { type: 'mrkdwn', text: `*Occupation:*\n${occupation || '—'}` },
          { type: 'mrkdwn', text: `*Training age:*\n${trainingAge || '—'}` },
          { type: 'mrkdwn', text: `*Gym type:*\n${gymType || '—'}` },
          { type: 'mrkdwn', text: `*Days/week:*\n${trainingDays || '—'}` },
          { type: 'mrkdwn', text: `*Injuries:*\n${injuries || 'None'}` },
        ]
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Goals:*\n${Array.isArray(goals) ? goals.join(', ') : goals || '—'}` }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '👀 View in Admin' },
            style: 'primary',
            url: `https://wadestrong.com.au/admin-crm.html`
          }
        ]
      },
      { type: 'divider' },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `📧 ${email} · ⏰ ${aest()}` }] }
    ]
  };
}

function athleteMessage({ name, email, age, location, compName, compDate, compLevel, weightClass, numComps, bestResult, strongEvents, weakEvents }) {
  return {
    text: `🥇 New athlete enquiry — ${name} wants Pre-Comp coaching!`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: '🥇 New Athlete Client Enquiry' } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${name}* has submitted their pre-comp questionnaire. Review and decide whether to accept.` }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${name}` },
          { type: 'mrkdwn', text: `*Age:*\n${age || '—'}` },
          { type: 'mrkdwn', text: `*Location:*\n${location || '—'}` },
          { type: 'mrkdwn', text: `*Weight class:*\n${weightClass || '—'}` },
          { type: 'mrkdwn', text: `*Competitions:*\n${numComps || '—'}` },
          { type: 'mrkdwn', text: `*Best result:*\n${bestResult || '—'}` },
        ]
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Competition:*\n${compName || '—'}` },
          { type: 'mrkdwn', text: `*Comp date:*\n${compDate || '—'}` },
          { type: 'mrkdwn', text: `*Level:*\n${compLevel || '—'}` },
        ]
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Strong events:*\n${Array.isArray(strongEvents) ? strongEvents.join(', ') : strongEvents || '—'}` },
          { type: 'mrkdwn', text: `*Weak events:*\n${Array.isArray(weakEvents) ? weakEvents.join(', ') : weakEvents || '—'}` },
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '✅ Accept athlete' },
            style: 'primary',
            url: `https://wadestrong.com.au/admin-crm.html`
          },
          {
            type: 'button',
            text: { type: 'plain_text', text: '👀 View full profile' },
            url: `https://wadestrong.com.au/admin-crm.html`
          }
        ]
      },
      { type: 'divider' },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `📧 ${email} · ⏰ ${aest()}` }] }
    ]
  };
}

function customRequestMessage({ name, email, location, requestType, details }) {
  return {
    text: `✈️ New custom coaching request — ${name} from ${location}!`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: '✈️ New Custom Coaching Request' } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${name}* wants in-person coaching. They're in *${location || 'unknown location'}*.` }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Name:*\n${name}` },
          { type: 'mrkdwn', text: `*Email:*\n${email}` },
          { type: 'mrkdwn', text: `*Location:*\n${location || '—'}` },
          { type: 'mrkdwn', text: `*Type:*\n${requestType || '—'}` },
        ]
      },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*Their message:*\n_${details || '—'}_` }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '💬 Reply to enquiry' },
            style: 'primary',
            url: `mailto:${email}`
          }
        ]
      },
      { type: 'divider' },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `⏰ ${aest()}` }] }
    ]
  };
}

function rpe10Message({ name, email, deadlift, squat, bench, ohp }) {
  return {
    text: `💪 ${name} just submitted their RPE10 results — ready to build program!`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: '📊 RPE10 Results Submitted' } },
      {
        type: 'section',
        text: { type: 'mrkdwn', text: `*${name}* has completed their testing session. Time to build their program Wade! 🔨` }
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Deadlift:*\n${deadlift ? deadlift + 'kg' : '—'}` },
          { type: 'mrkdwn', text: `*Squat:*\n${squat ? squat + 'kg' : '—'}` },
          { type: 'mrkdwn', text: `*Bench:*\n${bench ? bench + 'kg' : '—'}` },
          { type: 'mrkdwn', text: `*OHP:*\n${ohp ? ohp + 'kg' : '—'}` },
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '🏋️ Build program now' },
            style: 'primary',
            url: 'https://wadestrong.com.au/program-builder.html'
          }
        ]
      },
      { type: 'divider' },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `📧 ${email} · ⏰ ${aest()}` }] }
    ]
  };
}

function sessionLogMessage({ name, sessionName, weekNum, feel }) {
  const feelEmoji = { great:'🔥', good:'👍', average:'😐', off:'😴' }[feel] || '📋';
  return {
    text: `${feelEmoji} ${name} logged ${sessionName} — Week ${weekNum}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: `${feelEmoji} Session Logged` } },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Client:*\n${name}` },
          { type: 'mrkdwn', text: `*Session:*\n${sessionName}` },
          { type: 'mrkdwn', text: `*Week:*\n${weekNum}` },
          { type: 'mrkdwn', text: `*Feel:*\n${feelEmoji} ${feel}` },
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '📊 View RPE feedback' },
            url: 'https://wadestrong.com.au/admin-crm.html'
          }
        ]
      },
      { type: 'divider' },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `⏰ ${aest()}` }] }
    ]
  };
}

function clipMessage({ name, exerciseName, sessionName }) {
  return {
    text: `🎥 ${name} sent a clip — ${exerciseName}`,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: '🎥 New Clip to Review' } },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Client:*\n${name}` },
          { type: 'mrkdwn', text: `*Exercise:*\n${exerciseName}` },
          { type: 'mrkdwn', text: `*Session:*\n${sessionName}` },
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: { type: 'plain_text', text: '🎥 Review clip' },
            style: 'primary',
            url: 'https://wadestrong.com.au/admin-crm.html'
          }
        ]
      },
      { type: 'divider' },
      { type: 'context', elements: [{ type: 'mrkdwn', text: `⏰ ${aest()}` }] }
    ]
  };
}

// ── MAIN HANDLER ──────────────────────────────────────────────

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { type, data } = payload;
  let webhook, message;

  switch (type) {

    case 'payment_received':
      // Fires for ALL payments → #all-money-all-day
      webhook = SLACK_WEBHOOKS.all_money;
      message = moneyMessage(data);
      break;

    case 'get_strong_questionnaire':
      // Client submitted Get Strong questionnaire → #new-get-strong-client
      // Also fires notification to #all-money-all-day handled by Stripe webhook
      webhook = SLACK_WEBHOOKS.new_get_strong;
      message = getStrongMessage(data);
      break;

    case 'athlete_questionnaire':
      // Pre-comp client submitted questionnaire → #new-athlete-client
      webhook = SLACK_WEBHOOKS.new_athlete;
      message = athleteMessage(data);
      break;

    case 'custom_request':
      // In-person coaching enquiry form submitted → #new-custom-request
      webhook = SLACK_WEBHOOKS.new_custom;
      message = customRequestMessage(data);
      break;

    case 'rpe10_submitted':
      // Client submitted RPE10 results → #all-money-all-day (Wade needs to know, not a new client alert)
      webhook = SLACK_WEBHOOKS.all_money;
      message = rpe10Message(data);
      break;

    case 'session_logged':
      // No Slack notification — Wade checks admin panel
      return { statusCode: 200, body: JSON.stringify({ sent: false, reason: 'session logs not notified' }) };

    case 'clip_uploaded':
      // No Slack notification — Wade checks admin panel
      return { statusCode: 200, body: JSON.stringify({ sent: false, reason: 'clips not notified' }) };

    default:
      return { statusCode: 400, body: `Unknown notification type: ${type}` };
  }

  try {
    await sendSlack(webhook, message);
    return { statusCode: 200, body: JSON.stringify({ sent: true, type }) };
  } catch (err) {
    console.error('Slack notification error:', err);
    return { statusCode: 500, body: err.message };
  }
};
