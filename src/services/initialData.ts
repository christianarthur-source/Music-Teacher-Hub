import {
  UserPreferences,
  Area,
  Project,
  TaskItem,
  LessonPlan,
  ClassSection,
  CalendarEvent,
  ChorusSong,
  ConcertProgram,
  SeatingChart,
  JournalEntry,
  ResourceLink,
  InstrumentItem,
  BeatPattern
} from '../types';

export const INITIAL_PREFERENCES: UserPreferences = {
  appName: 'Music Teacher Hub',
  teacherName: 'Christian Vance',
  schoolName: 'Lincoln Elementary School',
  roomNumber: 'Room 104 (Music & Chorus)',
  darkMode: false,
  accentColor: 'blue',
  defaultClassDuration: 40,
  metronomeSound: 'woodblock',
  tunerRefA4: 440,
  googleCalendarConnected: false,
  pinnedNavigation: ['home', 'planner', 'tasks', 'tools', 'chorus', 'visuals']
};

export const INITIAL_AREAS: Area[] = [
  { id: 'area-genmus', name: 'General Music (K–6)', icon: 'Music', color: '#0c87eb' },
  { id: 'area-chorus', name: '6th-Grade Chorus', icon: 'Users', color: '#be123c' },
  { id: 'area-concerts', name: 'Concerts & Assemblies', icon: 'Sparkles', color: '#d97706' },
  { id: 'area-curriculum', name: 'Curriculum & NYS Standards', icon: 'BookOpen', color: '#059669' },
  { id: 'area-cart', name: 'Music Cart & Instruments', icon: 'Boxes', color: '#7c3aed' },
  { id: 'area-admin', name: 'School Admin & Parents', icon: 'FileText', color: '#475569' },
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-winter-concert',
    title: 'Winter Concert 2026 Preparation',
    areaId: 'area-concerts',
    deadline: '2026-12-10',
    notes: 'Combined 5th/6th grade chorus + Grade 4 recorder ensemble performance in the auditorium.',
    completed: false,
    color: '#d97706'
  },
  {
    id: 'proj-recorder-karate',
    title: 'Grade 4 Recorder Karate Unit Launch',
    areaId: 'area-curriculum',
    deadline: '2026-11-20',
    notes: 'Sterilize instruments, prepare student method books, print belt assessment checklists.',
    completed: false,
    color: '#059669'
  },
  {
    id: 'proj-orff-restring',
    title: 'Music Cart & Orff Maintenance',
    areaId: 'area-cart',
    deadline: '2026-11-15',
    notes: 'Replace worn rubber tubing on Studio 49 soprano metallophone and retune soprano xylophone bars.',
    completed: false,
    color: '#7c3aed'
  }
];

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Send Winter Concert permission slips & riser rehearsal schedule to 6th grade families',
    notes: 'Make sure to mention concert attire: white tops and black bottoms.',
    completed: false,
    createdAt: '2026-11-01T08:00:00Z',
    dueDate: '2026-11-06',
    priority: 'high',
    tags: ['chorus', 'parents', 'admin'],
    areaId: 'area-chorus',
    projectId: 'proj-winter-concert',
    listType: 'today',
    subtasks: [
      { id: 'sub-1', title: 'Draft memo in Google Docs', completed: true },
      { id: 'sub-2', title: 'Get principal signature', completed: true },
      { id: 'sub-3', title: 'Make 85 copies for homeroom folders', completed: false },
      { id: 'sub-4', title: 'Post copy to school communication portal', completed: false }
    ]
  },
  {
    id: 'task-2',
    title: 'Review Part 2 entrance on measure 24 of "Kusimama"',
    notes: 'The leap from F4 down to C4 is causing some pitch sagging in the Alto section.',
    completed: false,
    createdAt: '2026-11-02T09:00:00Z',
    dueDate: '2026-11-03',
    priority: 'high',
    tags: ['chorus', 'rehearsal'],
    areaId: 'area-chorus',
    projectId: 'proj-winter-concert',
    listType: 'today',
    subtasks: [
      { id: 'sub-5', title: 'Use solfege hand signs (Sol to Do)', completed: false },
      { id: 'sub-6', title: 'Isolate Part 2 with piano accompaniment', completed: false }
    ]
  },
  {
    id: 'task-3',
    title: 'Prep 2nd Grade Orff barred instruments for "Bell Horses" ostinato',
    notes: 'Remove F and B bars so instruments are set up in C Pentatonic (C-D-E-G-A).',
    completed: false,
    createdAt: '2026-11-02T07:30:00Z',
    dueDate: '2026-11-03',
    priority: 'medium',
    tags: ['genmus', 'prep', 'instruments'],
    areaId: 'area-genmus',
    listType: 'today',
    subtasks: [
      { id: 'sub-7', title: 'Remove F & B bars from 4 glockenspiels', completed: false },
      { id: 'sub-8', title: 'Pair mallets (soft yarn mallets for xylophones)', completed: false }
    ]
  },
  {
    id: 'task-4',
    title: 'Submit Q1 general music grades and NYS Arts standard assessments',
    notes: 'Assessments based on steady beat rubric and vocal pitch matching.',
    completed: false,
    createdAt: '2026-10-28T14:00:00Z',
    dueDate: '2026-11-14',
    priority: 'medium',
    tags: ['grading', 'admin'],
    areaId: 'area-admin',
    listType: 'upcoming',
    subtasks: []
  },
  {
    id: 'task-5',
    title: 'Sanitize Yamaha recorders for 4th Grade Karate Unit',
    notes: 'Run through warm water mild soap solution and dry on cart rack.',
    completed: false,
    createdAt: '2026-10-30T10:00:00Z',
    dueDate: '2026-11-18',
    priority: 'low',
    tags: ['equipment', 'cart'],
    areaId: 'area-cart',
    projectId: 'proj-recorder-karate',
    listType: 'upcoming',
    subtasks: []
  },
  {
    id: 'task-6',
    title: 'Explore folk dance "The Virginia Reel" for 5th Grade American Heritage unit',
    notes: 'Find instrumental track in Link Library and test longways set formation.',
    completed: false,
    createdAt: '2026-11-01T12:00:00Z',
    priority: 'low',
    tags: ['curriculum', 'movement'],
    areaId: 'area-genmus',
    listType: 'anytime',
    subtasks: []
  },
  {
    id: 'task-7',
    title: 'Apply for District Foundation Grant: 15 Kala Waterman Ukuleles',
    notes: 'Grant deadline is in spring. Total budget ~$750.',
    completed: false,
    createdAt: '2026-10-15T10:00:00Z',
    priority: 'none',
    tags: ['grant', 'ukulele'],
    areaId: 'area-cart',
    listType: 'someday',
    subtasks: []
  },
  {
    id: 'task-8',
    title: 'Create solfege tone ladder poster for Room 104 whiteboard',
    notes: 'Color coded to Boomwhacker pitch colors.',
    completed: true,
    completedAt: '2026-10-29T16:00:00Z',
    createdAt: '2026-10-25T11:00:00Z',
    priority: 'medium',
    tags: ['visuals', 'classroom'],
    areaId: 'area-genmus',
    listType: 'logbook',
    subtasks: []
  }
];

export const INITIAL_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'lesson-k-beat',
    title: 'Steady Beat vs. Silence & Musical Freeze Dance',
    grade: 'K',
    unit: 'Foundations of Beat & Voice Exploration',
    durationMinutes: 35,
    overview: 'Kindergarteners distinguish between steady continuous pulse and silence, moving freely to the beat and freezing on the rest.',
    objectives: [
      'Students will demonstrate steady beat with gross motor movement (patting knees, marching).',
      'Students will freeze immediately when the music stops to experience the musical rest.'
    ],
    musicalConcepts: ['Steady Beat', 'Sound vs. Silence', 'High/Low Voice', 'Gross Motor Coordination'],
    standards: ['MU:Cr1.1.K', 'MU:Pr4.1.K', 'MU:Re7.1.K'],
    materialsNeeded: ['Hand drum (teacher pulse)', 'Scarf basket (one per child)', 'Bluetooth speaker'],
    assessmentStrategy: 'Informal observation during Freeze Dance and knee-patting circle check.',
    differentiationNotes: 'For students working on balance, offer seated scarf movement with same beat pulse.',
    activities: [
      {
        id: 'act-k-1',
        title: 'Vocal Siren Warm-Up & Welcome Song',
        durationMinutes: 5,
        description: 'Vocal roll-call with slide whistle and vocal sirens up to head voice (woo-woo-woo). Sing "Hello Kindergarten Friends".',
        musicalConcept: 'Singing Voice / Pitch Matching'
      },
      {
        id: 'act-k-2',
        title: 'Echo Clapping & Drum Walk',
        durationMinutes: 8,
        description: 'Teacher plays steady beat on hand drum. Students walk around the perimeter stepping exactly in time. Stop drum = freeze like statues!',
        musicalConcept: 'Steady Beat'
      },
      {
        id: 'act-k-3',
        title: 'Scarf Dance: Camille Saint-Saëns "The Aquarium"',
        durationMinutes: 12,
        description: 'Hand out colorful movement scarves. Guide smooth flowing movements matching the legato orchestral texture and sudden pauses.',
        musicalConcept: 'Movement / Expressive Qualities'
      },
      {
        id: 'act-k-4',
        title: 'Singing Game: "Grizzly Bear, Oh Grizzly Bear"',
        durationMinutes: 7,
        description: 'One student acts as sleeping bear while class walks quietly in a circle singing. Loud ending triggers tag & sit.',
        musicalConcept: 'Dynamics (p vs f)'
      },
      {
        id: 'act-k-5',
        title: 'Calm Down & Line Up Song',
        durationMinutes: 3,
        description: 'Sing goodbye chant using whispering voice. Line up order by shirt color.',
        musicalConcept: 'Cool Down'
      }
    ],
    createdAt: '2026-10-15T09:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
    favorite: true
  },
  {
    id: 'lesson-1-rhythm',
    title: 'Introduction to Quarter Note (Ta) and Paired Eighth Notes (Ti-Ti)',
    grade: '1',
    unit: 'Rhythm Literacy & Iconic-to-Standard Notation',
    durationMinutes: 40,
    overview: 'First graders connect spoken speech chants to short and long sounds, transitioning from popsicle stick heartbeat icons to Ta and Ti-Ti standard notation.',
    objectives: [
      'Students will read and clap 4-beat rhythm cards containing quarter notes and eighth note pairs.',
      'Students will aurally identify whether a musical word has one sound (Ta) or two sounds (Ti-Ti).'
    ],
    musicalConcepts: ['Quarter Note (Ta)', 'Eighth Notes (Ti-Ti)', 'Quarter Rest (Shh)', 'Meter (4/4)'],
    standards: ['MU:Cr1.1.1', 'MU:Pr4.2.1'],
    materialsNeeded: ['Rhythm flash cards (4-beat sets)', 'Rhythm sticks (pair for each student)', 'Smart Board display'],
    assessmentStrategy: 'Individual check: student claps rhythm card handed to them during the circle pass.',
    activities: [
      {
        id: 'act-1-1',
        title: 'Vocal Warmup: Echo Sing "High & Low Birds"',
        durationMinutes: 5,
        description: 'Pitch matching echo patterns (so-mi) using bird puppet visual.',
        musicalConcept: 'Pitch Matching'
      },
      {
        id: 'act-1-2',
        title: 'Poem Chant: "Engine, Engine Number Nine"',
        durationMinutes: 10,
        description: 'Chant rhyme while tapping knees. Count words that have 1 sound vs 2 sounds. Transition to rhythm sticks.',
        musicalConcept: 'Beat vs. Rhythm'
      },
      {
        id: 'act-1-3',
        title: 'Smart Board Rhythm Interactive Game',
        durationMinutes: 12,
        description: 'Use the interactive Rhythm Visualizer on the screen. Drag train cars with 1 coal car (Ta) or 2 coal cars (Ti-Ti) to build 4-beat measures.',
        musicalConcept: 'Standard Notation'
      },
      {
        id: 'act-1-4',
        title: 'Stick Passing Game: "Bee, Bee, Bumblebee"',
        durationMinutes: 10,
        description: 'Pass rhythm sticks clockwise on the steady beat while chanting. Student holding the marked stick improvises a 4-beat answer.',
        musicalConcept: 'Improvisation & Beat'
      },
      {
        id: 'act-1-5',
        title: 'Review & Line Up Exit Ticket',
        durationMinutes: 3,
        description: 'Each student claps a 2-beat flashcard as their ticket to the line.',
        musicalConcept: 'Assessment'
      }
    ],
    createdAt: '2026-10-18T10:00:00Z',
    updatedAt: '2026-11-01T11:00:00Z',
    favorite: true
  },
  {
    id: 'lesson-2-orff',
    title: 'Pentatonic Barred Instruments & "Bell Horses" Ostinato',
    grade: '2',
    unit: 'Melodic Contour & Orff Instrument Exploration',
    durationMinutes: 40,
    overview: 'Second graders prepare Orff instruments in C-Pentatonic, perform the folk song "Bell Horses", and accompany with a crossover bass bordun.',
    objectives: [
      'Students will properly hold mallets using relaxed pinch-and-roll technique.',
      'Students will play a C-G bordun accompaniment while singing the melody in tune.'
    ],
    musicalConcepts: ['Pentatonic Scale', 'Ostinato / Bordun', 'Mallet Technique', 'Singing & Playing'],
    standards: ['MU:Cr1.1.2', 'MU:Pr4.2.2', 'MU:Re7.2.2'],
    materialsNeeded: ['Studio 49 Soprano/Alto Xylophones (4)', 'Metallophones (2)', 'Bass Xylophone (1)', 'Yarn mallets'],
    assessmentStrategy: 'Rubric score on mallet bounce technique and maintaining steady accompaniment bordun.',
    activities: [
      {
        id: 'act-2-1',
        title: 'Solfege Warmup: So-Mi-La Hand Signs',
        durationMinutes: 6,
        description: 'Curwen hand signs practice. Sing solfege telephone numbers and echo sing patterns.',
        musicalConcept: 'Solfege Literacy'
      },
      {
        id: 'act-2-2',
        title: 'Song Learning: "Bell Horses"',
        durationMinutes: 8,
        description: 'Rote singing and movement. Trace melodic contour with hands in the air.',
        musicalConcept: 'Singing & Contour'
      },
      {
        id: 'act-2-3',
        title: 'Instrument Demonstration & Mallet Etiquette',
        durationMinutes: 6,
        description: 'Show bounce touch ("hot stove" mallet bounce). Assign student instrument partners.',
        musicalConcept: 'Instrument Technique'
      },
      {
        id: 'act-2-4',
        title: 'Orff Ensemble Performance (Rotations)',
        durationMinutes: 16,
        description: 'Group A sings and plays unpitched percussion; Group B plays C-G bordun on xylophones; rotate roles so every child plays.',
        musicalConcept: 'Ensemble Performance'
      },
      {
        id: 'act-2-5',
        title: 'Resting Mallets & Orderly Reset',
        durationMinutes: 4,
        description: 'Place mallets across bars ("mallets to rest"). Clean room checklist.',
        musicalConcept: 'Cart Etiquette'
      }
    ],
    createdAt: '2026-10-20T14:00:00Z',
    updatedAt: '2026-11-01T14:00:00Z',
    favorite: true
  },
  {
    id: 'lesson-3-treble',
    title: 'Treble Clef Staff Adventure: E-G-B-D-F and F-A-C-E',
    grade: '3',
    unit: 'Staff Reading & Pitch Literacy',
    durationMinutes: 40,
    overview: 'Third graders master lines and spaces on the treble clef staff using whole-body staff floor games, mnemonic devices, and interactive notation.',
    objectives: [
      'Students will identify pitch names on the five lines (Every Good Boy Does Fine) and four spaces (FACE).',
      'Students will spell 3-letter musical words (BAG, CAB, FED) using notes on the staff.'
    ],
    musicalConcepts: ['Treble Clef', 'Lines & Spaces', 'Absolute Note Names', 'Pitch Encoding'],
    standards: ['MU:Cr1.1.3', 'MU:Pr4.2.3', 'MU:Cn10.1.3'],
    materialsNeeded: ['Floor staff masking tape (or 5-line rug)', 'Note beanbags', 'Whiteboard markers'],
    assessmentStrategy: 'Musical word spelling worksheet & floor staff stepping accuracy.',
    activities: [
      {
        id: 'act-3-1',
        title: 'Vocal Sirens & Treble Staff Mnemonic Song',
        durationMinutes: 7,
        description: 'Chant "E-G-B-D-F, Lines are best! F-A-C-E, Spaces for me!" with clapping rhythm.',
        musicalConcept: 'Memory Anchors'
      },
      {
        id: 'act-3-2',
        title: 'Floor Staff Relay: Step on the Note',
        durationMinutes: 12,
        description: 'Students stand along the lines. Teacher calls a letter name; runners hop to the matching line or space.',
        musicalConcept: 'Spatial Pitch Mapping'
      },
      {
        id: 'act-3-3',
        title: 'Interactive Staff Visualizer (Digital Classroom Visual)',
        durationMinutes: 11,
        description: 'Use the Classroom Visuals interactive staff on the projector. Call students up to click and place notes to spell words like "C-A-B" and "B-E-E-F".',
        musicalConcept: 'Notation Literacy'
      },
      {
        id: 'act-3-4',
        title: 'Glockenspiel Pitch Matching',
        durationMinutes: 7,
        description: 'Find E, G, B, D on the glockenspiel and match audio pitches to visual notation.',
        musicalConcept: 'Aural & Visual Transfer'
      },
      {
        id: 'act-3-5',
        title: 'Exit Slip Wrap-Up',
        durationMinutes: 3,
        description: 'Quick check: What word do the spaces spell?',
        musicalConcept: 'Review'
      }
    ],
    createdAt: '2026-10-22T08:00:00Z',
    updatedAt: '2026-11-01T15:00:00Z',
    favorite: false
  },
  {
    id: 'lesson-4-recorder',
    title: 'Grade 4 Recorder Karate: Mastering "Hot Cross Buns" (B-A-G)',
    grade: '4',
    unit: 'Woodwind Technique & Recorder Karate',
    durationMinutes: 40,
    overview: 'Fourth graders reinforce gentle warm breath, thumb and finger seal on tone holes, and perform B-A-G to earn their White Belt.',
    objectives: [
      'Students will produce a clear, mellow tone without squeaking by using gentle warm "doo" articulation.',
      'Students will perform "Hot Cross Buns" with accurate rhythm and correct left hand fingering.'
    ],
    musicalConcepts: ['Breath Support', 'Left Hand on Top', 'Tonguing ("Doo")', 'B-A-G Notes'],
    standards: ['MU:Cr1.1.4', 'MU:Pr4.2.4', 'MU:Pr6.1.4'],
    materialsNeeded: ['Soprano Recorders', 'White belt reward yarn ribbons', 'Hot Cross Buns sheet music', 'Metronome set to 76 BPM'],
    assessmentStrategy: 'Individual or small group playing assessment for Recorder Karate White Belt.',
    activities: [
      {
        id: 'act-4-1',
        title: 'Breath Exercise: Gentle Candle Flame',
        durationMinutes: 5,
        description: 'Blow on back of hand with warm breath. Practice tongue tap behind front teeth ("doo-doo-doo").',
        musicalConcept: 'Tone Production'
      },
      {
        id: 'act-4-2',
        title: 'Fingering Check: Left Hand on Top Rule',
        durationMinutes: 8,
        description: 'Left hand check! Cover thumb hole and hole 1 (B), add hole 2 (A), add hole 3 (G). Check finger pad circles.',
        musicalConcept: 'Finger Placement'
      },
      {
        id: 'act-4-3',
        title: 'Echo Play with Teacher: B-A-G Patterns',
        durationMinutes: 10,
        description: 'Teacher plays 4 beats; class echoes. Use Practice Studio accompaniment track at 80% speed.',
        musicalConcept: 'Ear-to-Hand Coordination'
      },
      {
        id: 'act-4-4',
        title: 'Belt Assessment Testing & Practice Stations',
        durationMinutes: 14,
        description: 'Students practice in partner pairs while teacher listens to 4 students at a time for white belt testing.',
        musicalConcept: 'Independent Practice'
      },
      {
        id: 'act-4-5',
        title: 'Sanitize & Swab Recorders',
        durationMinutes: 3,
        description: 'Wipe down mouthpieces, store in protective cases, and pack into cart bins.',
        musicalConcept: 'Instrument Care'
      }
    ],
    createdAt: '2026-10-25T11:00:00Z',
    updatedAt: '2026-11-02T09:00:00Z',
    favorite: true
  },
  {
    id: 'lesson-6-chorus',
    title: '6th Grade Chorus: Diction, Breath Support & 2-Part Blend on "Kusimama"',
    grade: '6',
    unit: 'Choral Repertoire & Vocal Independence',
    durationMinutes: 45,
    overview: 'Sixth-grade chorus explores resonant vowel shape, energetic Swahili diction, and part independence on Jim Papoulis’s "Kusimama".',
    objectives: [
      'Singers will sing pure open Italian vowels (tall vowels) with energized breath support.',
      'Soprano and Alto sections will hold their independent harmonic lines during the measure 17 contrapuntal section.'
    ],
    musicalConcepts: ['2-Part Choral Harmony', 'Diction & Vowel Modification', 'Breath Management', 'Swahili Text'],
    standards: ['MU:Cr1.1.6', 'MU:Pr4.2.6', 'MU:Pr6.1.6', 'MU:Cn11.1.6'],
    materialsNeeded: ['Piano', 'Sheet music folders for 6th Grade Chorus', 'Audio Practice Studio with track', 'Djembe drum'],
    assessmentStrategy: 'Choral balance observation; sectional self-reflection on balance and cutoffs.',
    activities: [
      {
        id: 'act-6-1',
        title: 'Physical & Vocal Warmup: Posture, Lip Trills & Vowels',
        durationMinutes: 8,
        description: 'Spine alignment stretch, rolling shoulders, lip trills on 5-tone scales, descending "ah-eh-ee-oh-oo" with open jaw.',
        musicalConcept: 'Vocal Technique'
      },
      {
        id: 'act-6-2',
        title: 'Diction & Rhythm Drill: Swahili Text ("Kusimama")',
        durationMinutes: 8,
        description: 'Spoken text in rhythm with djembe pulse: "Kusimama, watoto, tutasimama". Crisp consonants "K", "T", "S".',
        musicalConcept: 'Choral Diction & Language'
      },
      {
        id: 'act-6-3',
        title: 'Sectional Rehearsal: Part 2 Harmony Isolation',
        durationMinutes: 14,
        description: 'Altos/Part 2 sing measures 17-32 with piano support. Sopranos hum their countermelody. Switch and combine.',
        musicalConcept: 'Harmonic Independence'
      },
      {
        id: 'act-6-4',
        title: 'Full Run-Through with Dynamic Nuances',
        durationMinutes: 11,
        description: 'Full chorus run-through from the top with djembe accompaniment. Focus on crescendo into the chorus and crisp cutoffs.',
        musicalConcept: 'Ensemble Performance'
      },
      {
        id: 'act-6-5',
        title: 'Rehearsal Debrief & Target for Next Rehearsal',
        durationMinutes: 4,
        description: 'Singers rate today’s focus on 1-5 scale and note measure 24 leap for next rehearsal.',
        musicalConcept: 'Self-Reflection'
      }
    ],
    createdAt: '2026-10-28T13:00:00Z',
    updatedAt: '2026-11-02T10:00:00Z',
    favorite: true
  }
];

export const INITIAL_CLASSES: ClassSection[] = [
  {
    id: 'class-k-gable',
    name: 'K-Gable (Kindergarten)',
    grade: 'K',
    room: 'Room 102',
    meetingDayTime: 'Day 1, Period 2 (9:30 - 10:05)',
    lastLessonDeliveredId: 'lesson-k-beat',
    lastDeliveredDate: '2026-10-29',
    completedActivitiesCount: 4,
    notesForNextTime: 'Repeat Grizzly Bear game; Leo and Mia loved the movement scarves.',
    studentCount: 19
  },
  {
    id: 'class-1-evans',
    name: '1-Evans (Grade 1)',
    grade: '1',
    room: 'Room 108',
    meetingDayTime: 'Day 2, Period 3 (10:15 - 10:55)',
    lastLessonDeliveredId: 'lesson-1-rhythm',
    lastDeliveredDate: '2026-10-30',
    completedActivitiesCount: 5,
    notesForNextTime: 'Introduce quarter rest symbol (shh) on rhythm cards next week.',
    studentCount: 22
  },
  {
    id: 'class-2-clark',
    name: '2-Clark (Grade 2)',
    grade: '2',
    room: 'Room 114',
    meetingDayTime: 'Day 3, Period 4 (11:00 - 11:40)',
    lastLessonDeliveredId: 'lesson-2-orff',
    lastDeliveredDate: '2026-10-31',
    completedActivitiesCount: 4,
    notesForNextTime: 'Rotate Group B to the bass xylophones for bordun practice.',
    studentCount: 21
  },
  {
    id: 'class-3-higgins',
    name: '3-Higgins (Grade 3)',
    grade: '3',
    room: 'Room 201',
    meetingDayTime: 'Day 4, Period 1 (8:50 - 9:30)',
    lastLessonDeliveredId: 'lesson-3-treble',
    lastDeliveredDate: '2026-10-27',
    completedActivitiesCount: 5,
    notesForNextTime: 'Play musical spelling bee with whiteboards.',
    studentCount: 24
  },
  {
    id: 'class-4-miller',
    name: '4-Miller (Grade 4)',
    grade: '4',
    room: 'Room 205',
    meetingDayTime: 'Day 5, Period 5 (1:00 - 1:40)',
    lastLessonDeliveredId: 'lesson-4-recorder',
    lastDeliveredDate: '2026-11-01',
    completedActivitiesCount: 4,
    notesForNextTime: '12 students still need white belt test; start with testing station.',
    studentCount: 23
  },
  {
    id: 'class-6-chorus',
    name: '6th-Grade Chorus (Combined)',
    grade: 'Chorus',
    room: 'Auditorium / Stage',
    meetingDayTime: 'Every Tuesday & Thursday (2:15 - 3:00)',
    lastLessonDeliveredId: 'lesson-6-chorus',
    lastDeliveredDate: '2026-10-31',
    completedActivitiesCount: 5,
    notesForNextTime: 'Drill measure 24 Alto leap and begin staging on auditorium risers.',
    studentCount: 68
  }
];

export const INITIAL_CHORUS_SONGS: ChorusSong[] = [
  {
    id: 'song-kusimama',
    title: 'Kusimama (Stand Tall)',
    composer: 'Jim Papoulis',
    voicing: '2-Part',
    key: 'F Major',
    tempoBpm: 124,
    durationString: '3:15',
    status: 'refining',
    notes: 'Energetic African-inspired choral piece. Requires djembe accompaniment and hand claps.',
    targetConcert: 'Winter Concert 2026',
    part1Notes: 'High melody, crisp Swahili vowels, joyful expression.',
    part2Notes: 'Rhythmic counterpoint and sustained harmony notes. Watch measure 24 downward leap.',
    sheetMusicDriveUrl: 'https://drive.google.com/file/d/sample-kusimama-score/view',
    rehearsalHistory: [
      { date: '2026-10-24', focusMeasures: 'mm. 1-16', notes: 'Mastered Swahili diction and rhythm of the A section.' },
      { date: '2026-10-29', focusMeasures: 'mm. 17-32', notes: 'Part 2 needs more confidence without piano doublings.' }
    ]
  },
  {
    id: 'song-shoshone',
    title: 'Shoshone Love Song',
    composer: 'Roger Emerson',
    arranger: 'Roger Emerson',
    voicing: '2-Part',
    key: 'D Minor',
    tempoBpm: 72,
    durationString: '2:50',
    status: 'learning',
    notes: 'Haunting Native American melody with lyrical legato phrasing. Emphasize warm breath and tall vowels.',
    targetConcert: 'Winter Concert 2026',
    part1Notes: 'Flute-like head voice, smooth connections between phrases.',
    part2Notes: 'Lush supporting thirds. Maintain pitch on the sustained D4 pedal.',
    sheetMusicDriveUrl: 'https://drive.google.com/file/d/sample-shoshone-score/view',
    rehearsalHistory: [
      { date: '2026-10-26', focusMeasures: 'mm. 1-12', notes: 'Introduced English poem translation and minor tonality warm-up.' }
    ]
  },
  {
    id: 'song-rhythm-life',
    title: 'The Rhythm of Life (Sweet Charity)',
    composer: 'Cy Coleman',
    arranger: 'Peter Barnes',
    voicing: '2-Part',
    key: 'C Major',
    tempoBpm: 138,
    durationString: '3:30',
    status: 'considering',
    notes: 'Showstopper Broadway fast-tempo piece. Excellent for building fast diction and dynamic contrast for the Spring Concert.',
    targetConcert: 'Spring District Showcase 2027',
    rehearsalHistory: []
  },
  {
    id: 'song-winter-wind',
    title: 'A Winter Wind Whispers',
    composer: 'Mary Donnelly & George L.O. Strid',
    voicing: '2-Part',
    key: 'G Minor',
    tempoBpm: 84,
    durationString: '2:40',
    status: 'polished',
    notes: 'Winter mood with wind sound effects (vocal swish) and minor bell ostinato.',
    targetConcert: 'Winter Concert 2026',
    rehearsalHistory: [
      { date: '2026-10-15', focusMeasures: 'Full Run', notes: 'Memorized! Dynamics and whisper balance are excellent.' }
    ]
  }
];

export const INITIAL_CONCERT: ConcertProgram = {
  id: 'concert-winter-2026',
  title: 'Lincoln Elementary Annual Winter Concert 2026',
  date: '2026-12-10',
  time: '7:00 PM',
  location: 'Lincoln Elementary Auditorium',
  notes: 'Sound check at 6:15 PM in cafeteria. Stage lighting set to warm wash.',
  repertoireIds: ['song-winter-wind', 'song-kusimama', 'song-shoshone'],
  orderOfProgram: [
    {
      customTitle: 'Welcome & Opening Remarks by Principal & Music Director',
      ensemble: 'Welcome',
      durationMinutes: 4
    },
    {
      customTitle: 'Recorder Karate Showcase: "Hot Cross Buns" & "Merrily We Roll Along"',
      ensemble: 'Grade 4 Recorder Ensemble',
      notes: 'Students march down center aisle onto floor in front of stage.',
      durationMinutes: 6
    },
    {
      songId: 'song-winter-wind',
      ensemble: '6th Grade Chorus',
      notes: 'Chorus standing on 4 risers. Flute accompaniment by guest teacher.',
      durationMinutes: 4
    },
    {
      songId: 'song-shoshone',
      ensemble: '6th Grade Chorus',
      durationMinutes: 4
    },
    {
      songId: 'song-kusimama',
      ensemble: '6th Grade Chorus with Djembe & Percussion',
      notes: 'Percussion ensemble from 5th Grade joins stage.',
      durationMinutes: 5
    },
    {
      customTitle: 'Combined Finale: "Winter Starlight" Sing-Along with Audience',
      ensemble: 'Combined 4th, 5th, 6th Grades & Audience',
      durationMinutes: 5
    }
  ]
};

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: '6th Grade Chorus Rehearsal',
    startDate: '2026-11-03T14:15:00',
    endDate: '2026-11-03T15:00:00',
    category: 'chorus',
    location: 'Auditorium Stage',
    grade: 'Chorus',
    color: '#be123c',
    source: 'local'
  },
  {
    id: 'ev-2',
    title: 'Grade 2 Music (2-Clark)',
    startDate: '2026-11-03T11:00:00',
    endDate: '2026-11-03T11:40:00',
    category: 'class',
    location: 'Room 104',
    grade: '2',
    color: '#0c87eb',
    source: 'local'
  },
  {
    id: 'ev-3',
    title: 'Grade 4 Music (4-Miller) - Recorder Belt Test',
    startDate: '2026-11-03T13:00:00',
    endDate: '2026-11-03T13:40:00',
    category: 'class',
    location: 'Room 104',
    grade: '4',
    color: '#0c87eb',
    source: 'local'
  },
  {
    id: 'ev-4',
    title: 'Music Department Professional Learning Community (PLC)',
    startDate: '2026-11-04T15:15:00',
    endDate: '2026-11-04T16:15:00',
    category: 'pd',
    location: 'District Music Office / Zoom',
    color: '#7c3aed',
    source: 'local'
  },
  {
    id: 'ev-5',
    title: 'Veterans Day School Assembly (Chorus Singing Anthem)',
    startDate: '2026-11-10T09:30:00',
    endDate: '2026-11-10T10:30:00',
    category: 'assembly',
    location: 'Gymnasium',
    grade: 'Chorus',
    color: '#d97706',
    source: 'local'
  },
  {
    id: 'ev-6',
    title: 'Winter Concert Dress Rehearsal',
    startDate: '2026-12-09T09:00:00',
    endDate: '2026-12-09T11:30:00',
    category: 'rehearsal',
    location: 'Auditorium',
    grade: 'Chorus',
    color: '#be123c',
    source: 'local'
  },
  {
    id: 'ev-7',
    title: 'Lincoln Elementary Annual Winter Concert',
    startDate: '2026-12-10T19:00:00',
    endDate: '2026-12-10T20:30:00',
    category: 'concert',
    location: 'Auditorium',
    grade: 'Chorus',
    color: '#be123c',
    source: 'local'
  }
];

export const INITIAL_SEATING_CHARTS: SeatingChart[] = [
  {
    id: 'chart-room-104-semicircle',
    title: 'Room 104 — Elementary Music Semi-Circle (2-Clark)',
    classSectionId: 'class-2-clark',
    grade: '2',
    layoutType: 'semicircle',
    rowsCount: 3,
    seatsPerRow: 8,
    teacherDeskPosition: 'front-center',
    pianoPosition: 'left',
    instrumentCartPosition: 'front-right',
    createdAt: '2026-10-10T10:00:00Z',
    students: [
      { row: 0, col: 1, student: { id: 'st-1', name: 'Liam M.', seatNumber: 1, tags: ['needs front'] } },
      { row: 0, col: 2, student: { id: 'st-2', name: 'Sophia R.', seatNumber: 2, tags: ['strong leader'] } },
      { row: 0, col: 3, student: { id: 'st-3', name: 'Noah B.', seatNumber: 3 } },
      { row: 0, col: 4, student: { id: 'st-4', name: 'Emma T.', seatNumber: 4, tags: ['pitch leader'] } },
      { row: 0, col: 5, student: { id: 'st-5', name: 'Jackson K.', seatNumber: 5 } },
      { row: 0, col: 6, student: { id: 'st-6', name: 'Olivia H.', seatNumber: 6 } },

      { row: 1, col: 0, student: { id: 'st-7', name: 'Lucas W.', seatNumber: 7 } },
      { row: 1, col: 1, student: { id: 'st-8', name: 'Ava D.', seatNumber: 8 } },
      { row: 1, col: 2, student: { id: 'st-9', name: 'Ethan P.', seatNumber: 9 } },
      { row: 1, col: 3, student: { id: 'st-10', name: 'Mia S.', seatNumber: 10 } },
      { row: 1, col: 4, student: { id: 'st-11', name: 'Mason C.', seatNumber: 11 } },
      { row: 1, col: 5, student: { id: 'st-12', name: 'Isabella G.', seatNumber: 12 } },
      { row: 1, col: 6, student: { id: 'st-13', name: 'Aiden J.', seatNumber: 13 } },
      { row: 1, col: 7, student: { id: 'st-14', name: 'Harper N.', seatNumber: 14 } },

      { row: 2, col: 1, student: { id: 'st-15', name: 'Oliver F.', seatNumber: 15 } },
      { row: 2, col: 2, student: { id: 'st-16', name: 'Charlotte V.', seatNumber: 16 } },
      { row: 2, col: 3, student: { id: 'st-17', name: 'Elijah Z.', seatNumber: 17 } },
      { row: 2, col: 4, student: { id: 'st-18', name: 'Amelia L.', seatNumber: 18 } },
      { row: 2, col: 5, student: { id: 'st-19', name: 'Benjamin Y.', seatNumber: 19 } },
      { row: 2, col: 6, student: { id: 'st-20', name: 'Evelyn X.', seatNumber: 20 } }
    ]
  },
  {
    id: 'chart-chorus-risers',
    title: 'Auditorium Choral Risers — 6th Grade Chorus (2-Part)',
    classSectionId: 'class-6-chorus',
    grade: 'Chorus',
    layoutType: 'risers',
    rowsCount: 3,
    seatsPerRow: 12,
    teacherDeskPosition: 'front-center',
    pianoPosition: 'left',
    instrumentCartPosition: 'back',
    createdAt: '2026-10-12T11:00:00Z',
    students: [
      // Row 1 (Riser 1 - Sopranos Left, Altos Right)
      { row: 0, col: 0, student: { id: 'ch-1', name: 'Maya S.', seatNumber: 1, voicePart: 'Part 1', tags: ['tall vowel lead'] } },
      { row: 0, col: 1, student: { id: 'ch-2', name: 'Chloe T.', seatNumber: 2, voicePart: 'Part 1' } },
      { row: 0, col: 2, student: { id: 'ch-3', name: 'Ella M.', seatNumber: 3, voicePart: 'Part 1' } },
      { row: 0, col: 3, student: { id: 'ch-4', name: 'Grace B.', seatNumber: 4, voicePart: 'Part 1' } },
      { row: 0, col: 4, student: { id: 'ch-5', name: 'Lily P.', seatNumber: 5, voicePart: 'Part 1' } },
      { row: 0, col: 5, student: { id: 'ch-6', name: 'Hannah R.', seatNumber: 6, voicePart: 'Part 1' } },
      { row: 0, col: 6, student: { id: 'ch-7', name: 'Alex K.', seatNumber: 7, voicePart: 'Part 2', tags: ['steady alto anchor'] } },
      { row: 0, col: 7, student: { id: 'ch-8', name: 'Jordan W.', seatNumber: 8, voicePart: 'Part 2' } },
      { row: 0, col: 8, student: { id: 'ch-9', name: 'Taylor N.', seatNumber: 9, voicePart: 'Part 2' } },
      { row: 0, col: 9, student: { id: 'ch-10', name: 'Morgan C.', seatNumber: 10, voicePart: 'Part 2' } },
      { row: 0, col: 10, student: { id: 'ch-11', name: 'Sam D.', seatNumber: 11, voicePart: 'Part 2' } },
      { row: 0, col: 11, student: { id: 'ch-12', name: 'Casey L.', seatNumber: 12, voicePart: 'Part 2' } },

      // Row 2 (Riser 2)
      { row: 1, col: 0, student: { id: 'ch-13', name: 'Zoe E.', seatNumber: 13, voicePart: 'Part 1' } },
      { row: 1, col: 1, student: { id: 'ch-14', name: 'Natalie G.', seatNumber: 14, voicePart: 'Part 1' } },
      { row: 1, col: 2, student: { id: 'ch-15', name: 'Leah H.', seatNumber: 15, voicePart: 'Part 1' } },
      { row: 1, col: 3, student: { id: 'ch-16', name: 'Stella V.', seatNumber: 16, voicePart: 'Part 1' } },
      { row: 1, col: 4, student: { id: 'ch-17', name: 'Ruby Q.', seatNumber: 17, voicePart: 'Part 1' } },
      { row: 1, col: 5, student: { id: 'ch-18', name: 'Sadie J.', seatNumber: 18, voicePart: 'Part 1' } },
      { row: 1, col: 6, student: { id: 'ch-19', name: 'Cameron F.', seatNumber: 19, voicePart: 'Part 2' } },
      { row: 1, col: 7, student: { id: 'ch-20', name: 'Avery Z.', seatNumber: 20, voicePart: 'Part 2' } },
      { row: 1, col: 8, student: { id: 'ch-21', name: 'Riley X.', seatNumber: 21, voicePart: 'Part 2' } },
      { row: 1, col: 9, student: { id: 'ch-22', name: 'Logan Y.', seatNumber: 22, voicePart: 'Part 2' } },
      { row: 1, col: 10, student: { id: 'ch-23', name: 'Jamie O.', seatNumber: 23, voicePart: 'Part 2' } },
      { row: 1, col: 11, student: { id: 'ch-24', name: 'Dakota U.', seatNumber: 24, voicePart: 'Part 2' } }
    ]
  }
];

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'jrn-1',
    date: '2026-11-02',
    title: 'Outstanding breakthroughs with 2nd grade pentatonic xylophones!',
    content: `Today in Room 104, 2-Clark had their first full rotation on the Orff barred instruments for "Bell Horses". Removing the F and B bars ahead of time was the key move—it eliminated wrong-note anxiety and let the children focus completely on mallet bounce and steady crossover borduns.

What worked:
- Having mallets resting horizontally across the bars when not playing saved our ears and kept focus tight.
- Pairing confident beat-keepers with students still developing pulse.

Tomorrow's adjustment:
- Add unpitched triangles on beat 1 for the bell horse sound effect.`,
    tags: ['orff', 'grade-2', 'success', 'mallet-technique'],
    mood: 'great',
    energyLevel: 5,
    templateType: 'what_worked',
    pinned: true
  },
  {
    id: 'jrn-2',
    date: '2026-10-31',
    title: 'Chorus Rehearsal Notes: Alto section holding their own',
    content: `Rehearsed "Kusimama" in the auditorium. When we stepped onto the risers for the first time this semester, the singers naturally straightened their posture. 

Part 2 held their harmony on the bridge without collapsing into the soprano melody! The visual solfege hand signs (Sol down to Do) provided the anchor they needed. 

Next rehearsal: we will bring in the djembe and shaker to lock in the 124 BPM tempo before winter concert.`,
    tags: ['chorus', 'rehearsal', 'harmonies'],
    mood: 'good',
    energyLevel: 4,
    templateType: 'chorus_notes',
    pinned: false
  }
];

export const INITIAL_RESOURCES: ResourceLink[] = [
  {
    id: 'link-1',
    title: 'Grade K-6 Music Curriculum Folder (Google Drive)',
    url: 'https://drive.google.com/drive/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ',
    description: 'Master district curriculum maps, unit pacing guides, and seasonal song sheets.',
    category: 'drive',
    grade: 'All',
    tags: ['curriculum', 'district', 'pacing'],
    isGoogleDrive: true,
    driveType: 'folder',
    isFavorite: true,
    lastUsed: '2026-11-02'
  },
  {
    id: 'link-2',
    title: 'Winter Concert 2026 Choral Scores & Part Audio Tracks (Google Drive)',
    url: 'https://drive.google.com/drive/folders/1WinterConcertScoresAndRehearsalMp3s',
    description: 'Choral scores, rehearsal accompaniment tracks, and lyric printouts.',
    category: 'drive',
    grade: 'Chorus',
    tags: ['chorus', 'winter-concert', 'scores'],
    isGoogleDrive: true,
    driveType: 'folder',
    isFavorite: true,
    lastUsed: '2026-11-01'
  },
  {
    id: 'link-3',
    title: 'Chrome Music Lab (Song Maker, Rhythm, Kandinsky)',
    url: 'https://musiclab.chromeexperiments.com/',
    description: 'Hands-on interactive audio experiments for interactive whiteboards and Chromebooks.',
    category: 'game',
    grade: 'All',
    tags: ['interactive', 'chromebook', 'composition'],
    isGoogleDrive: false,
    isFavorite: true,
    lastUsed: '2026-10-28'
  },
  {
    id: 'link-4',
    title: 'Classics for Kids — Composer Timelines & Audio Games',
    url: 'https://www.classicsforkids.com/',
    description: 'Orchestral listening activities, composer biographies, and musical instrument games.',
    category: 'listening',
    grade: '3',
    tags: ['composers', 'listening', 'history'],
    isGoogleDrive: false,
    isFavorite: false
  },
  {
    id: 'link-5',
    title: 'MusicplayOnline Curriculum Portal',
    url: 'https://musicplayonline.com/',
    description: 'Interactive song library, solfege tone ladders, and recorder play-along videos.',
    category: 'sheet_music',
    grade: 'All',
    tags: ['curriculum', 'play-along', 'songs'],
    isGoogleDrive: false,
    isFavorite: true
  },
  {
    id: 'link-6',
    title: 'NYS Arts Learning Standards for Music (Official NYSED PDF)',
    url: 'https://drive.google.com/file/d/1NYS-Arts-Standards-Music-Official/view',
    description: 'Official New York State P-12 Arts Learning Standards for Music benchmark guide.',
    category: 'drive',
    grade: 'All',
    tags: ['standards', 'nysed', 'assessment'],
    isGoogleDrive: true,
    driveType: 'pdf',
    isFavorite: false
  }
];

export const INITIAL_INVENTORY: InstrumentItem[] = [
  { id: 'inv-1', name: 'Studio 49 Soprano Xylophone SX-G (C Pentatonic / Diatonic)', category: 'orff_barred', location: 'Music Cart', quantity: 2, condition: 'excellent', notes: 'Rubber tubing replaced Sept 2026.' },
  { id: 'inv-2', name: 'Studio 49 Alto Xylophone AX-G', category: 'orff_barred', location: 'Music Cart', quantity: 2, condition: 'good' },
  { id: 'inv-3', name: 'Studio 49 Bass Xylophone BX-G', category: 'orff_barred', location: 'Room 104 Shelf A', quantity: 1, condition: 'good', notes: 'Heavy; stays in room on rolling stand.' },
  { id: 'inv-4', name: 'Studio 49 Soprano Glockenspiel SG', category: 'orff_barred', location: 'Music Cart', quantity: 4, condition: 'excellent' },
  { id: 'inv-5', name: 'Makala Soprano Ukuleles (MK-S)', category: 'ukulele', location: 'Music Cart', quantity: 12, condition: 'good', notes: 'Aquila strings installed. Retuned weekly.' },
  { id: 'inv-6', name: 'Yamaha YRS-24B Soprano Recorders (Baroque Fingering)', category: 'recorder', location: 'Closet B', quantity: 45, condition: 'excellent', notes: 'Sanitized and boxed for Grade 4.' },
  { id: 'inv-7', name: 'Boomwhackers Diatonic 8-Note Set (C-c)', category: 'boomwhackers', location: 'Music Cart', quantity: 4, condition: 'excellent' },
  { id: 'inv-8', name: 'Remo Buffalo Hand Drum 14" with Mallet', category: 'unpitched_percussion', location: 'Music Cart', quantity: 1, condition: 'excellent', notes: 'Primary teacher beat keeper.' },
  { id: 'inv-9', name: 'Assorted Woodblocks & Claves (Pairs)', category: 'unpitched_percussion', location: 'Music Cart', quantity: 16, condition: 'good' },
  { id: 'inv-10', name: 'Pearl African Djembe 12" Rope Tuned', category: 'unpitched_percussion', location: 'Stage', quantity: 1, condition: 'good', notes: 'Used for Chorus "Kusimama".' }
];

export const INITIAL_BEAT_PATTERNS: BeatPattern[] = [
  {
    id: 'pat-steady-beat',
    title: 'Kindergarten & 1st: Steady Heartbeat (Quarter Notes)',
    tempo: 84,
    timeSignature: '4/4',
    steps: 16,
    category: 'educational',
    tracks: [
      { name: 'Heartbeat Drum', sound: 'kick', volume: 0.9, muted: false, solo: false, grid: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false] },
      { name: 'Woodblock Pulse', sound: 'woodblock', volume: 0.8, muted: false, solo: false, grid: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false] },
      { name: 'Triangle Accent', sound: 'triangle', volume: 0.6, muted: false, solo: false, grid: [true, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] },
      { name: 'Clap (Ti-Ti 8ths)', sound: 'clap', volume: 0.0, muted: true, solo: false, grid: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false] }
    ]
  },
  {
    id: 'pat-ta-titi',
    title: 'Grade 1 Rhythm: Ta & Ti-Ti (Quarter & 8ths)',
    tempo: 96,
    timeSignature: '4/4',
    steps: 16,
    category: 'educational',
    tracks: [
      { name: 'Ta (Quarter)', sound: 'kick', volume: 0.85, muted: false, solo: false, grid: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false] },
      { name: 'Ti-Ti (Eighths)', sound: 'woodblock', volume: 0.9, muted: false, solo: false, grid: [false, false, false, false, true, false, true, false, false, false, false, false, true, false, true, false] },
      { name: 'Rest / Shh (Beat 4)', sound: 'hihat_c', volume: 0.4, muted: false, solo: false, grid: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false] },
      { name: 'Agogo High', sound: 'agogo', volume: 0.7, muted: false, solo: false, grid: [true, false, false, false, true, false, true, false, true, false, false, false, true, false, true, false] }
    ]
  },
  {
    id: 'pat-clave-ostinato',
    title: 'Grade 5 & 6: Son Clave 3-2 Ostinato',
    tempo: 112,
    timeSignature: '4/4',
    steps: 16,
    category: 'world',
    tracks: [
      { name: 'Clave 3-2', sound: 'woodblock', volume: 0.95, muted: false, solo: false, grid: [true, false, false, true, false, false, true, false, false, false, true, false, true, false, false, false] },
      { name: 'Conga / Low Drum', sound: 'kick', volume: 0.8, muted: false, solo: false, grid: [true, false, false, false, false, false, true, false, false, false, false, false, true, false, false, false] },
      { name: 'Maracas (Steady 8ths)', sound: 'hihat_c', volume: 0.6, muted: false, solo: false, grid: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false] },
      { name: 'Cowbell Accent', sound: 'cowbell', volume: 0.75, muted: false, solo: false, grid: [true, false, false, false, true, false, false, false, true, false, false, false, true, false, false, false] }
    ]
  },
  {
    id: 'pat-rock-groove',
    title: 'Classroom Pop / Rock Steady Groove',
    tempo: 108,
    timeSignature: '4/4',
    steps: 16,
    category: 'groove',
    tracks: [
      { name: 'Bass Kick', sound: 'kick', volume: 0.9, muted: false, solo: false, grid: [true, false, false, false, false, false, false, false, true, false, false, false, false, false, false, false] },
      { name: 'Snare Drum', sound: 'snare', volume: 0.9, muted: false, solo: false, grid: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] },
      { name: 'Closed Hi-Hat', sound: 'hihat_c', volume: 0.75, muted: false, solo: false, grid: [true, false, true, false, true, false, true, false, true, false, true, false, true, false, true, false] },
      { name: 'Open Hi-Hat', sound: 'hihat_o', volume: 0.65, muted: false, solo: false, grid: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, true, false] },
      { name: 'Hand Clap', sound: 'clap', volume: 0.7, muted: false, solo: false, grid: [false, false, false, false, true, false, false, false, false, false, false, false, true, false, false, false] }
    ]
  }
];
