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
    rpe = {}
  } = clientData;

  const maxes = {
    deadlift: rpe.deadlift_1rm || 0,
    squat: rpe.squat_raw_1rm || 0,
    bench: rpe.bench_1rm || 0,
    press: rpe.press_1rm || 0,
  };

  const ex = selectExercises(gymType, equipment);
  const program = {};

  for (let week = 1; week <= 6; week++) {
    const sessions = [];
    
    // Always include 3 sessions — add 4th if 4 days selected
    sessions.push({ ...buildSession('A', week, ex, maxes, gymType), id: `w${week}a` });
    sessions.push({ ...buildSession('B', week, ex, maxes, gymType), id: `w${week}b` });
    sessions.push({ ...buildSession('C', week, ex, maxes, gymType), id: `w${week}c` });
    
    if (trainingDays >= 4) {
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

// Export for use in other files
if (typeof module !== 'undefined') module.exports = { generateProgram, selectExercises, rpeToWeight };
