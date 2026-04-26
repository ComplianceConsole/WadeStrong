// ============================================================
// WADE STRONG — AUTO PROGRAM GENERATOR
// Generates a 6-week Get Strong program based on:
// - Client's RPE testing results (1RM values)
// - Gym type (commercial / home / strongman)
// - Equipment available (for home gym)
// - Training days per week (3 or 4)
// ============================================================

// RPE to % of 1RM conversion
const RPE_PERCENT = {
  6: 0.78, 6.5: 0.80, 7: 0.83, 7.5: 0.85,
  8: 0.88, 8.5: 0.90, 9: 0.93, 9.5: 0.96, 10: 1.00
};

function rpeToWeight(oneRM, rpe) {
  const pct = RPE_PERCENT[rpe] || 0.85;
  return Math.round((oneRM * pct) / 2.5) * 2.5; // Round to nearest 2.5kg
}

// ── EXERCISE SELECTION BY GYM TYPE ──────────────────────────

function selectExercises(gymType, equipment = []) {
  const has = (item) => equipment.includes(item);
  const isCommercial = gymType === 'commercial';
  const isStrongman = gymType === 'strongman';
  const isHome = gymType === 'home';

  return {
    // Main lower
    mainLower: 'Deadlift',
    secondaryLower: 'Back Squat',
    accessoryLower1: 'Romanian Deadlift',
    accessoryLower2: isCommercial || isStrongman ? 'Leg Press' : (has('bands') ? 'Band Pull Through' : 'Single Leg RDL'),
    
    // Main upper
    mainPress: isStrongman || has('log') ? 'Log Press' :
               has('axel') ? 'Axel Bar Press' : 'Barbell Overhead Press',
    secondaryPress: 'Bench Press',
    accessoryPress1: isCommercial ? 'Dumbbell Shoulder Press' : (has('dumbbells') ? 'Dumbbell Shoulder Press' : 'Pike Push Up'),
    accessoryPress2: isCommercial ? 'Cable Tricep Pushdown' : (has('bands') ? 'Band Tricep Pushdown' : 'Close Grip Push Up'),
    
    // Pull
    mainPull: isCommercial ? 'Barbell Row' : 'Barbell Row',
    secondaryPull: isCommercial ? 'Lat Pulldown' : (has('pullup') ? 'Pull Up' : 'Dumbbell Row'),
    accessoryPull: isCommercial ? 'Face Pull' : (has('bands') ? 'Band Face Pull' : 'Dumbbell Rear Delt Fly'),
    
    // Carry / conditioning
    carry: isStrongman || has('farmers') ? 'Farmers Carry' :
           has('kettlebells') ? 'Kettlebell Suitcase Carry' :
           has('dumbbells') ? 'Dumbbell Suitcase Carry' : 'Barbell Carry',
    
    // Strongman specific (only for strongman gym)
    atlas: isStrongman || has('stones') ? 'Atlas Stone to Platform' : 'Heavy Squat',
    yoke: isStrongman || has('yoke') ? 'Yoke Walk' : 'Barbell Front Squat',
    log: isStrongman || has('log') ? 'Log Press' : 'Barbell Overhead Press',
    
    // Core
    core1: 'Plank',
    core2: isCommercial ? 'Ab Wheel Rollout' : (has('bands') ? 'Band Pallof Press' : 'Dead Bug'),
  };
}

// ── WEEK TEMPLATES ──────────────────────────────────────────

const WEEK_TEMPLATES = {
  1: { label: 'Foundation', intensity: 'Technique focus — build the pattern', mainRpe: 7, accessoryRpe: 6.5, sets: 4, reps: 5 },
  2: { label: 'Foundation', intensity: 'Add load — stay crisp', mainRpe: 7.5, accessoryRpe: 7, sets: 4, reps: 5 },
  3: { label: 'Build', intensity: 'Push the main lifts', mainRpe: 8, accessoryRpe: 7.5, sets: 4, reps: 3 },
  4: { label: 'Build', intensity: 'Volume + intensity', mainRpe: 8.5, accessoryRpe: 8, sets: 5, reps: 3 },
  5: { label: 'Peak', intensity: 'Heavy — trust the training', mainRpe: 9, accessoryRpe: 8, sets: 4, reps: 2 },
  6: { label: 'Peak', intensity: 'Test your numbers', mainRpe: 9.5, accessoryRpe: 8.5, sets: 3, reps: 1 },
};

// ── SESSION BUILDER ──────────────────────────────────────────

function buildSession(sessionType, weekNum, ex, maxes, gymType) {
  const w = WEEK_TEMPLATES[weekNum];
  const dl = maxes.deadlift || 0;
  const sq = maxes.squat || 0;
  const bp = maxes.bench || 0;
  const ohp = maxes.press || 0;

  const sessions = {

    // SESSION A — DEADLIFT + PRESS
    A: {
      name: 'Session A — Deadlift & Press',
      day: 'Day 1',
      targetRpe: `${w.mainRpe}`,
      blocks: [
        {
          name: 'DEADLIFT',
          rest: 240,
          exercises: [
            {
              name: ex.mainLower,
              notes: weekNum <= 2 ? 'Focus on setup — bar over mid-foot, tight lats, big breath' : weekNum <= 4 ? 'Push the floor away, stay over the bar' : 'This is your comp weight range — own it',
              sets: w.sets,
              reps: weekNum >= 5 ? 2 : weekNum >= 3 ? 3 : 5,
              weight: dl > 0 ? rpeToWeight(dl, w.mainRpe) : 0,
              rpe: w.mainRpe
            },
            {
              name: ex.accessoryLower1,
              notes: '3 second lower — feel the stretch',
              sets: 3,
              reps: 8,
              weight: dl > 0 ? rpeToWeight(dl * 0.6, w.accessoryRpe) : 0,
              rpe: w.accessoryRpe
            }
          ]
        },
        {
          name: ex.mainPress.toUpperCase(),
          rest: 180,
          exercises: [
            {
              name: ex.mainPress,
              notes: weekNum <= 2 ? 'Lock the core, drive the bar in a straight line' : 'Tight upper back — push yourself under the bar',
              sets: w.sets,
              reps: weekNum >= 5 ? 2 : weekNum >= 3 ? 3 : 5,
              weight: ohp > 0 ? rpeToWeight(ohp, w.mainRpe) : 0,
              rpe: w.mainRpe
            },
            {
              name: ex.accessoryPress1,
              notes: 'Controlled — squeeze at the top',
              sets: 3,
              reps: 10,
              weight: 0,
              rpe: w.accessoryRpe
            }
          ]
        },
        {
          name: 'CORE',
          rest: 60,
          exercises: [
            { name: ex.core1, notes: '3 × 45 seconds', sets: 3, reps: 1, weight: 0, rpe: 0 },
            { name: ex.core2, notes: 'Quality reps — control the movement', sets: 3, reps: 12, weight: 0, rpe: 0 }
          ]
        }
      ]
    },

    // SESSION B — SQUAT + BENCH
    B: {
      name: 'Session B — Squat & Bench',
      day: 'Day 2',
      targetRpe: `${w.mainRpe}`,
      blocks: [
        {
          name: 'SQUAT',
          rest: 240,
          exercises: [
            {
              name: ex.secondaryLower,
              notes: weekNum <= 2 ? 'Hit depth on every rep — no grinding yet' : weekNum <= 4 ? 'Brace hard, stay upright' : 'Competition tempo — controlled down, drive up',
              sets: w.sets,
              reps: weekNum >= 5 ? 2 : weekNum >= 3 ? 3 : 5,
              weight: sq > 0 ? rpeToWeight(sq, w.mainRpe - 0.5) : 0,
              rpe: w.mainRpe - 0.5
            },
            {
              name: ex.accessoryLower2,
              notes: 'Quad focus — full range',
              sets: 3,
              reps: 10,
              weight: 0,
              rpe: w.accessoryRpe
            }
          ]
        },
        {
          name: 'BENCH PRESS',
          rest: 180,
          exercises: [
            {
              name: ex.secondaryPress,
              notes: weekNum <= 2 ? 'Retract the scaps, controlled descent' : 'Drive the bar, stay tight',
              sets: w.sets,
              reps: weekNum >= 5 ? 2 : weekNum >= 3 ? 3 : 5,
              weight: bp > 0 ? rpeToWeight(bp, w.mainRpe - 0.5) : 0,
              rpe: w.mainRpe - 0.5
            },
            {
              name: ex.accessoryPress2,
              notes: 'Elbow tuck, squeeze the triceps',
              sets: 3,
              reps: 12,
              weight: 0,
              rpe: w.accessoryRpe
            }
          ]
        },
        {
          name: 'PULLING',
          rest: 120,
          exercises: [
            {
              name: ex.mainPull,
              notes: 'Bar to lower chest, squeeze the lats',
              sets: 4,
              reps: 8,
              weight: 0,
              rpe: w.accessoryRpe
            },
            {
              name: ex.accessoryPull,
              notes: 'Rear delt and upper back — don\'t neglect this',
              sets: 3,
              reps: 15,
              weight: 0,
              rpe: 7
            }
          ]
        }
      ]
    },

    // SESSION C — FULL BODY / CARRY / STRONGMAN
    C: {
      name: 'Session C — Full Body & Carries',
      day: 'Day 3',
      targetRpe: `${w.mainRpe - 0.5}`,
      blocks: [
        {
          name: 'MAIN LIFT',
          rest: 180,
          exercises: [
            {
              name: weekNum >= 4 ? ex.mainLower : ex.secondaryLower,
              notes: 'Lighter day — focus on speed and technique',
              sets: 3,
              reps: 5,
              weight: dl > 0 ? rpeToWeight(dl, w.mainRpe - 1.5) : 0,
              rpe: w.mainRpe - 1.5
            }
          ]
        },
        {
          name: 'CARRIES',
          rest: 120,
          exercises: [
            {
              name: ex.carry,
              notes: gymType === 'strongman' ? '5 × 30m runs — fast and controlled' : '5 × 20m — walk tall, don\'t let it pull you sideways',
              sets: 5,
              reps: 1,
              weight: 0,
              rpe: 8
            }
          ]
        },
        {
          name: 'ACCESSORY',
          rest: 90,
          exercises: [
            {
              name: ex.secondaryPull,
              notes: '3 × 10 — pull with the lats not the biceps',
              sets: 3,
              reps: 10,
              weight: 0,
              rpe: 7.5
            },
            {
              name: ex.core2,
              notes: '3 × 12 each side',
              sets: 3,
              reps: 12,
              weight: 0,
              rpe: 7
            }
          ]
        }
      ]
    }
  };

  return sessions[sessionType];
}

// ── MAIN GENERATOR ──────────────────────────────────────────

function generateProgram(clientData) {
  const {
    gymType = 'commercial',
    equipment = [],
    trainingDays = 3,
    sessionLength = 60,
    rpe = {},
    questionnaire = {}
  } = clientData;

  // Use REAL Supabase column names from questionnaire
  const actualGymType = questionnaire.gym_type || questionnaire.gym_setup || gymType;
  const actualDays = parseInt(questionnaire.training_days_per_week || questionnaire.days_per_week || trainingDays) || 3;
  const actualSessionLength = parseInt(questionnaire.session_length_minutes || questionnaire.session_length || sessionLength) || 60;
  const actualEquipment = Array.isArray(questionnaire.equipment) ? questionnaire.equipment : equipment;

  const maxes = {
    deadlift: rpe.deadlift_1rm || 0,
    squat: rpe.squat_raw_1rm || 0,
    bench: rpe.bench_1rm || 0,
    press: rpe.press_1rm || 0,
  };

  const ex = selectExercises(actualGymType, actualEquipment);
  const program = {};

  // Adjust sets/reps based on session length
  const timeMultiplier = actualSessionLength <= 45 ? 0.75 : actualSessionLength >= 90 ? 1.25 : 1;

  for (let week = 1; week <= 6; week++) {
    const sessions = [];
    
    // Build sessions based on actual training days
    if (actualDays >= 1) sessions.push({ ...buildSession('A', week, ex, maxes, actualGymType), id: `w${week}a`, day: 'Day 1' });
    if (actualDays >= 2) sessions.push({ ...buildSession('B', week, ex, maxes, actualGymType), id: `w${week}b`, day: 'Day 2' });
    if (actualDays >= 3) sessions.push({ ...buildSession('C', week, ex, maxes, actualGymType), id: `w${week}c`, day: 'Day 3' });
    
    if (actualDays >= 4) {
      // 4th day = extra upper body / accessory
      sessions.push({
        id: `w${week}d`,
        name: 'Session D — Upper Accessory',
        day: 'Day 4',
        targetRpe: '7',
        blocks: [
          {
            name: 'PRESS',
            rest: 120,
            exercises: [
              { name: ex.accessoryPress1, notes: 'Pump work — controlled, feel the muscle', sets: 4, reps: 12, weight: 0, rpe: 7 },
              { name: ex.secondaryPress, notes: 'Lighter — perfect technique', sets: 3, reps: 8, weight: maxes.bench > 0 ? rpeToWeight(maxes.bench, 7) : 0, rpe: 7 },
            ]
          },
          {
            name: 'PULL',
            rest: 90,
            exercises: [
              { name: ex.secondaryPull, notes: '4 × 10', sets: 4, reps: 10, weight: 0, rpe: 7 },
              { name: ex.accessoryPull, notes: '3 × 15 — rear delts and upper back', sets: 3, reps: 15, weight: 0, rpe: 7 },
            ]
          }
        ]
      });
    }

    program[week] = sessions;
  }

  return program;
}

// ── PRE-COMP STRONGMAN GENERATOR ────────────────────────────

function generatePreCompProgram(clientData) {
  const {
    gymType = 'strongman',
    equipment = [],
    trainingDays = 4,
    sessionLength = 90,
    questionnaire = {},
    rpe = {}
  } = clientData;

  const q = questionnaire;
  const rawData = q.raw_data || {};

  // Use REAL Supabase column names
  const actualGymType = q.gym_type || q.gym_setup || gymType;
  const actualDays = parseInt(q.training_days_per_week || q.days_per_week || trainingDays) || 4;
  const actualSessionLength = parseInt(q.session_length_minutes || q.session_length || sessionLength) || 90;
  const events = Array.isArray(q.competition_events) ? q.competition_events : (Array.isArray(q.comp_events) ? q.comp_events : []);
  const weakEvents = Array.isArray(q.weak_events) ? q.weak_events : [];
  const timeToComp = q.time_to_comp || '8';

  const maxes = {
    deadlift: rpe.deadlift_1rm || 0,
    squat: rpe.squat_raw_1rm || 0,
    bench: rpe.bench_1rm || 0,
    press: rpe.press_1rm || 0,
  };

  // Determine total weeks based on time to comp
  const totalWeeks = timeToComp === '4-6' ? 6 : timeToComp === '11-14' ? 12 : timeToComp === '15plus' ? 16 : 8;

  // Event-specific exercise selection
  const hasLog = events.includes('log') || actualGymType === 'strongman' || equipment.includes('log');
  const hasStones = events.includes('stones') || equipment.includes('stones');
  const hasFarmers = events.includes('farmers') || equipment.includes('farmers');
  const hasYoke = events.includes('yoke') || equipment.includes('yoke');

  const program = {};

  for (let week = 1; week <= totalWeeks; week++) {
    const phase = week <= totalWeeks * 0.4 ? 'build' : week <= totalWeeks * 0.75 ? 'peak' : 'comp';
    const sessions = [];

    // Session A — Deadlift + Event specific
    sessions.push({
      id: `w${week}a`, name: 'Session A — Deadlift & Lower Events', day: 'Day 1', targetRpe: phase === 'build' ? '7-8' : phase === 'peak' ? '8-9' : '9',
      blocks: [
        {
          name: 'DEADLIFT', rest: 240,
          exercises: [
            { id:`e${week}a1`, name: actualGymType === 'strongman' ? 'Axle deadlift' : 'Deadlift', sets: phase === 'build' ? 5 : 4, reps: phase === 'build' ? 3 : phase === 'peak' ? 2 : 1, weight: maxes.deadlift > 0 ? rpeToWeight(maxes.deadlift, phase === 'build' ? 7.5 : phase === 'peak' ? 8.5 : 9) : 0, rpe: phase === 'build' ? 7.5 : 8.5, note: '' },
            { id:`e${week}a2`, name: 'Romanian deadlift', sets: 3, reps: 6, weight: maxes.deadlift > 0 ? rpeToWeight(maxes.deadlift * 0.6, 7) : 0, rpe: 7, note: '' },
          ]
        },
        ...(hasFarmers ? [{
          name: 'FARMERS CARRY', rest: 180,
          exercises: [{ id:`e${week}a3`, name: 'Farmers carry', sets: 5, reps: 1, weight: 0, rpe: weakEvents.includes('carries') ? 8 : 7, note: weakEvents.includes('carries') ? 'Priority event — push the weight this cycle' : '5 × 30m runs' }]
        }] : []),
        ...(hasYoke ? [{
          name: 'YOKE', rest: 180,
          exercises: [{ id:`e${week}a4`, name: 'Yoke walk', sets: 4, reps: 1, weight: 0, rpe: 7.5, note: '20m runs — focus on speed under load' }]
        }] : []),
      ]
    });

    // Session B — Press
    sessions.push({
      id: `w${week}b`, name: 'Session B — Pressing', day: 'Day 2', targetRpe: phase === 'build' ? '7-8' : '8-9',
      blocks: [
        {
          name: hasLog ? 'LOG PRESS' : 'OVERHEAD PRESS', rest: 240,
          exercises: [
            { id:`e${week}b1`, name: hasLog ? 'Log press' : 'Overhead press', sets: phase === 'build' ? 5 : 4, reps: phase === 'build' ? 3 : 2, weight: maxes.press > 0 ? rpeToWeight(maxes.press, phase === 'build' ? 7.5 : 8.5) : 0, rpe: phase === 'build' ? 7.5 : 8.5, note: weakEvents.includes('press') ? 'Priority — this is a weak event, push hard' : '' },
            { id:`e${week}b2`, name: 'Bench press', sets: 3, reps: 6, weight: maxes.bench > 0 ? rpeToWeight(maxes.bench, 7) : 0, rpe: 7, note: '' },
            { id:`e${week}b3`, name: 'Barbell row', sets: 4, reps: 8, weight: 0, rpe: 7.5, note: '' },
          ]
        }
      ]
    });

    // Session C — Squat + Stones
    if (actualDays >= 3) {
      sessions.push({
        id: `w${week}c`, name: 'Session C — Squat & Implements', day: 'Day 3', targetRpe: phase === 'build' ? '7' : '8',
        blocks: [
          {
            name: 'SQUAT', rest: 240,
            exercises: [
              { id:`e${week}c1`, name: 'Squat', sets: 4, reps: phase === 'build' ? 4 : 3, weight: maxes.squat > 0 ? rpeToWeight(maxes.squat, phase === 'build' ? 7.5 : 8) : 0, rpe: phase === 'build' ? 7.5 : 8, note: '' },
            ]
          },
          ...(hasStones ? [{
            name: 'ATLAS STONES', rest: 180,
            exercises: [{ id:`e${week}c2`, name: 'Atlas stone load', sets: 5, reps: 3, weight: 0, rpe: weakEvents.includes('stones') ? 8 : 7, note: weakEvents.includes('stones') ? 'Priority — work the technique hard this cycle' : 'Over bar — focus on lap technique' }]
          }] : []),
        ]
      });
    }

    // Session D — Accessory / Event practice
    if (actualDays >= 4) {
      sessions.push({
        id: `w${week}d`, name: 'Session D — Event Practice & Accessory', day: 'Day 4', targetRpe: '7',
        blocks: [
          {
            name: 'EVENT PRACTICE', rest: 120,
            exercises: events.filter(e => !['deadlift','log','stones','farmers','yoke'].includes(e)).map((ev, i) => ({
              id: `e${week}d${i}`, name: ev.charAt(0).toUpperCase() + ev.slice(1), sets: 4, reps: 3, weight: 0, rpe: 7, note: 'Event practice — focus on technique'
            }))
          },
          {
            name: 'ACCESSORY', rest: 90,
            exercises: [
              { id:`e${week}d10`, name: 'Pull-ups', sets: 3, reps: 8, weight: 0, rpe: 7, note: '' },
              { id:`e${week}d11`, name: 'Face pulls', sets: 3, reps: 15, weight: 0, rpe: 7, note: '' },
            ]
          }
        ]
      });
    }

    program[week] = sessions;
  }

  return program;
}

// Main entry point — detects program type
function generateAnyProgram(clientData) {
  const type = clientData.programType || clientData.questionnaire?.program_type || 'get_strong';
  if (type === 'pre_comp') return generatePreCompProgram(clientData);
  return generateProgram(clientData);
}


// ============================================================
// HYROX PROGRAM GENERATOR
// Official race order: Ski Erg, Sled Push, Sled Pull,
// Burpee Broad Jump, Rowing, Farmers Carry, Sandbag Lunges,
// Wall Balls. 8 x 1km runs between each.
// 
// Open Men weights = Pro Women weights
// ============================================================

const HYROX_WEIGHTS = {
  open_male:   { sled_push: 152, sled_pull: 103, farmers: 24, sandbag: 20, wall_ball: 6, wall_ball_height: 3.05 },
  open_female: { sled_push: 102, sled_pull: 78,  farmers: 16, sandbag: 10, wall_ball: 4, wall_ball_height: 2.75 },
  pro_male:    { sled_push: 202, sled_pull: 153, farmers: 32, sandbag: 30, wall_ball: 9, wall_ball_height: 3.05 },
  pro_female:  { sled_push: 152, sled_pull: 103, farmers: 24, sandbag: 20, wall_ball: 6, wall_ball_height: 2.75 },
  doubles:     { sled_push: 152, sled_pull: 103, farmers: 24, sandbag: 20, wall_ball: 6, wall_ball_height: 3.05 },
};

// Equipment substitutions for commercial gym (no sled etc)
function getCommercialGymSubstitute(station) {
  const subs = {
    'Sled Push':        'Heavy prowler push (or treadmill incline walk at 15% x 50m)',
    'Sled Pull':        'Seated cable row / heavy band pull (simulate pulling motion)',
    'Ski Erg':         'Ski Erg (if available) or seated cable pull-down x 1000m effort',
    'Farmers Carry':   'Farmers carry with dumbbells / kettlebells',
    'Sandbag Lunges':  'Barbell back rack lunges or dumbbell walking lunges',
    'Wall Balls':      'Wall balls (if available) or goblet squat + dumbbell press combo',
    'Rowing':          'Rowing erg (or assault bike for equivalent effort)',
    'Burpee Broad Jump': 'Burpee broad jump (no equipment needed)',
  };
  return subs[station] || station;
}

function generateHyroxProgram(clientData) {
  const {
    division = 'open_male',
    gymAccess = 'commercial',
    trainingDays = 4,
    sessionLength = 60,
    stationRatings = {},
    questionnaire = {}
  } = clientData;

  const weights = HYROX_WEIGHTS[division] || HYROX_WEIGHTS['open_male'];
  const hasHyroxEquip = gymAccess === 'hyrox_equipped' || gymAccess === 'crossfit';

  // Identify weak stations (rating 1-2) for extra focus
  const weakStations = Object.entries(stationRatings)
    .filter(([,v]) => v && v <= 2).map(([k]) => k);
  const strongStations = Object.entries(stationRatings)
    .filter(([,v]) => v && v >= 4).map(([k]) => k);

  const program = {};

  for (let week = 1; week <= 6; week++) {
    const phase = week <= 2 ? 'build' : week <= 4 ? 'develop' : 'peak';
    // Load progression: start at 60-70% of race weight, build to 100% by week 5-6
    const loadPct = week === 1 ? 0.60 : week === 2 ? 0.70 : week === 3 ? 0.80 : week === 4 ? 0.85 : week === 5 ? 0.95 : 1.0;

    const sessions = [];

    // SESSION 1: Baby Hyrox Simulation (every week - the centrepiece)
    sessions.push({
      id: `w${week}s1`,
      name: week <= 2 ? 'Baby Hyrox Sim - Intro' : week <= 4 ? 'Baby Hyrox Sim - Building' : 'Full Hyrox Sim - Race Pace',
      day: 'Day 1',
      targetRpe: phase === 'build' ? '7' : phase === 'develop' ? '8' : '9',
      notes: `RACE SIMULATION SESSION - Do all stations in official Hyrox order. Run 400m between each station (sub for 1km). Week ${week}: Use ${Math.round(loadPct * 100)}% of race weight. Focus on transitions and pacing, not just raw effort.`,
      blocks: [
        {
          name: 'HYROX SIMULATION',
          rest: 60,
          exercises: [
            { id:`w${week}s1e1`, name: '400m Run', sets: 1, reps: 1, weight: 0, rpe: 7, note: 'Race pace effort - build into it' },
            { id:`w${week}s1e2`, name: 'Ski Erg', sets: 1, reps: 1, weight: 0, rpe: 8, note: `500m (half race distance). Focus on rhythm and breathing. Damper 4-5.` },
            { id:`w${week}s1e3`, name: '400m Run', sets: 1, reps: 1, weight: 0, rpe: 7, note: 'Recover your breathing - do not stop' },
            { id:`w${week}s1e4`, name: hasHyroxEquip ? 'Sled Push' : 'Heavy Treadmill Incline Walk', sets: 1, reps: 1, weight: Math.round(weights.sled_push * loadPct), rpe: 9, note: `${hasHyroxEquip ? '4 x 12.5m' : '2 x 25m at max incline'}. ${Math.round(weights.sled_push * loadPct)}kg. Drive through the heel - low hips.` },
            { id:`w${week}s1e5`, name: '400m Run', sets: 1, reps: 1, weight: 0, rpe: 7, note: 'Legs will be heavy - expected. Keep moving.' },
            { id:`w${week}s1e6`, name: hasHyroxEquip ? 'Sled Pull' : 'Seated Cable Row (heavy)', sets: 1, reps: 1, weight: Math.round(weights.sled_pull * loadPct), rpe: 8, note: `${hasHyroxEquip ? '4 x 12.5m rope pull' : '20 heavy reps, back straight'}. ${Math.round(weights.sled_pull * loadPct)}kg.` },
            { id:`w${week}s1e7`, name: '400m Run', sets: 1, reps: 1, weight: 0, rpe: 7, note: '' },
            { id:`w${week}s1e8`, name: 'Burpee Broad Jump', sets: 1, reps: 1, weight: 0, rpe: 9, note: '40m (half). Stay explosive - do not rest hands on knees.' },
            { id:`w${week}s1e9`, name: '400m Run', sets: 1, reps: 1, weight: 0, rpe: 7, note: '' },
            { id:`w${week}s1e10`, name: 'Rowing', sets: 1, reps: 1, weight: 0, rpe: 8, note: '500m. Find your race split and hold it. Aim for negative split.' },
            { id:`w${week}s1e11`, name: '400m Run', sets: 1, reps: 1, weight: 0, rpe: 7, note: '' },
            { id:`w${week}s1e12`, name: 'Farmers Carry', sets: 1, reps: 1, weight: weights.farmers, rpe: 8, note: `2 x ${weights.farmers}kg - 100m (half). Unbroken if possible. Head up, shoulders back.` },
            { id:`w${week}s1e13`, name: '400m Run', sets: 1, reps: 1, weight: 0, rpe: 7, note: '' },
            { id:`w${week}s1e14`, name: 'Sandbag Lunges', sets: 1, reps: 1, weight: Math.round(weights.sandbag * loadPct), rpe: 9, note: `50m (half). ${Math.round(weights.sandbag * loadPct)}kg sandbag. Alternate knees - do not rush, this is where races fall apart.` },
            { id:`w${week}s1e15`, name: '400m Run', sets: 1, reps: 1, weight: 0, rpe: 7, note: 'Last run - push now' },
            { id:`w${week}s1e16`, name: 'Wall Balls', sets: 1, reps: week <= 2 ? 50 : week <= 4 ? 75 : 100, weight: weights.wall_ball, rpe: 10, note: `${week <= 2 ? 50 : week <= 4 ? 75 : 100} reps at ${weights.wall_ball}kg to ${weights.wall_ball_height}m target. Break into sets - e.g. 25-20-15-10-10. This is the finish line.` },
          ]
        }
      ]
    });

    // SESSION 2: Run + Weak Station Focus
    const weakFocusStation = weakStations[0] || 'wall_balls';
    sessions.push({
      id: `w${week}s2`,
      name: 'Run Intervals + Weak Station',
      day: 'Day 2',
      targetRpe: '7-8',
      notes: `Run work + targeted station training. Focus: ${weakFocusStation.replace(/_/g,' ')}`,
      blocks: [
        {
          name: 'RUN INTERVALS',
          rest: 90,
          exercises: [
            { id:`w${week}s2e1`, name: 'Treadmill - intervals', sets: week <= 2 ? 6 : week <= 4 ? 8 : 10, reps: 1, weight: 0, rpe: 8, note: `${week <= 2 ? '6' : week <= 4 ? '8' : '10'} x 400m at race pace. 60 sec recovery jog between. This is how you get faster between stations.` },
          ]
        },
        {
          name: `WEAK STATION - ${weakFocusStation.replace(/_/g,' ').toUpperCase()}`,
          rest: 120,
          exercises: [
            { id:`w${week}s2e2`, name: weakFocusStation === 'wall_balls' ? 'Wall Balls' : weakFocusStation === 'ski_erg' ? 'Ski Erg' : weakFocusStation === 'rowing' ? 'Rowing' : 'Station practice', sets: 4, reps: 1, weight: 0, rpe: 8, note: `4 x max effort sets. Focus on technique and efficiency. Log your times each set. Week ${week}: target consistent pacing across all 4 sets.` },
          ]
        }
      ]
    });

    if (trainingDays >= 3) {
      // SESSION 3: Strength - Station-Specific
      sessions.push({
        id: `w${week}s3`,
        name: 'Strength - Hyrox Station Builders',
        day: 'Day 3',
        targetRpe: '8',
        notes: 'Build the strength needed for each station. Heavier than race weight to build capacity.',
        blocks: [
          {
            name: 'LOWER BODY - SLED + LUNGE STRENGTH',
            rest: 180,
            exercises: [
              { id:`w${week}s3e1`, name: 'Squat', sets: 4, reps: 5, weight: 0, rpe: 8, note: 'Build leg drive for sled push. Controlled descent, explosive drive up.' },
              { id:`w${week}s3e2`, name: 'Bulgarian split squat', sets: 3, reps: 10, weight: 0, rpe: 8, note: 'Unilateral strength for lunges. Per leg.' },
              { id:`w${week}s3e3`, name: 'Romanian deadlift', sets: 3, reps: 8, weight: 0, rpe: 7, note: 'Posterior chain for sled pull and rowing.' },
            ]
          },
          {
            name: 'UPPER BODY + CARRY',
            rest: 120,
            exercises: [
              { id:`w${week}s3e4`, name: 'Farmers carry', sets: 4, reps: 1, weight: Math.round(weights.farmers * 1.1), rpe: 8, note: `Heavier than race weight: ${Math.round(weights.farmers * 1.1)}kg per hand x 40m. Build grip capacity.` },
              { id:`w${week}s3e5`, name: 'Seated row', sets: 4, reps: 8, weight: 0, rpe: 8, note: 'Simulate sled pull. Heavy. Full range of motion.' },
              { id:`w${week}s3e6`, name: 'Pull-ups', sets: 3, reps: 8, weight: 0, rpe: 7, note: 'Lat strength for ski erg and rowing.' },
            ]
          }
        ]
      });
    }

    if (trainingDays >= 4) {
      // SESSION 4: Steady State Run + Ski/Row
      sessions.push({
        id: `w${week}s4`,
        name: 'Aerobic Base - Long Run + Erg',
        day: 'Day 4',
        targetRpe: '6-7',
        notes: 'Build your aerobic engine. Easy effort - you should be able to hold a conversation.',
        blocks: [
          {
            name: 'LONG RUN',
            rest: 0,
            exercises: [
              { id:`w${week}s4e1`, name: 'Treadmill - run', sets: 1, reps: 1, weight: 0, rpe: 6, note: `${week <= 2 ? '20' : week <= 4 ? '25' : '30'} min steady state at comfortable pace. Zone 2 effort - nasal breathing.` },
            ]
          },
          {
            name: 'ERG WORK',
            rest: 90,
            exercises: [
              { id:`w${week}s4e2`, name: 'Ski Erg', sets: 3, reps: 1, weight: 0, rpe: 7, note: '3 x 3 min steady. Focus on technique - push through the whole body, not just arms.' },
              { id:`w${week}s4e3`, name: 'Rowing - erg', sets: 3, reps: 1, weight: 0, rpe: 7, note: '3 x 3 min. Legs first, then lean, then arms. Consistent split pace.' },
            ]
          }
        ]
      });
    }

    program[week] = sessions;
  }

  return program;
}

// Main entry point - check for hyrox program type
const _origGenerateAnyProgram = typeof generateAnyProgram === 'function' ? generateAnyProgram : null;
function generateAnyProgram(clientData) {
  const type = clientData.programType || clientData.questionnaire?.program_type || 'get_strong';
  if (type === 'hyrox') return generateHyroxProgram(clientData);
  if (type === 'pre_comp') return generatePreCompProgram(clientData);
  return generateProgram(clientData);
}

// Export for use in other files
if (typeof module !== 'undefined') module.exports = { generateProgram, generatePreCompProgram, generateHyroxProgram, generateAnyProgram, selectExercises, rpeToWeight };
