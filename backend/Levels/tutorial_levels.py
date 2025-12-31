TUTORIAL_LEVELS = [
  # --- BASICS ---
  {
    'id': 1,
    'name': "Straight Line",
    'description': "Move straight and light the goal.",
    'start': { 'x': 0, 'y': 2, 'dir': 1 },
    'goals': [{ 'x': 3, 'y': 2 }],
    'allowedTools': ["F", "L", "D"],
    'tutorial': {
      'lesson': "Welcome to the Program!",
      'text': "Your goal is to light up the blue tiles. Use the Forward (F) command to move, and the Light (L) command to toggle the light.",
      'tip': "You have limited space in your Main Method (Main).",
    },
    'heights': [
      [2, 2, 2, 2, 2, 2],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [2, 2, 2, 2, 2, 2]
    ]
  },
  {
    'id': 2,
    'name': "One Goal, High Ground",
    'description': "Reach the goal tile, noting the surrounding high walls.",
    'start': { 'x': 0, 'y': 2, 'dir': 1 },
    'goals': [{ 'x': 4, 'y': 2 }],
    'allowedTools': ["F", "L", "TR", "TL", "D"],
    'heights': [
      [4, 3, 2, 2, 3, 4],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 3, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [4, 3, 2, 2, 3, 4]
    ]
  },
  {
    'id': 3,
    'name': "Introducing Turns",
    'description': "Turn right and light all three goal tiles.",
    'start': { 'x': 0, 'y': 3, 'dir': 1 },
    'goals': [
      { 'x': 3, 'y': 2 },
      { 'x': 3, 'y': 3 },
      { 'x': 3, 'y': 1 },
    ],
    'allowedTools': ["F", "L", "TR", "TL", "J", "D"],
    'heights': [
      [0, 0, 1, 0, 0, 2],
      [0, 0, 1, 0, 0, 2],
      [0, 0, 1, 0, 0, 2],
      [0, 0, 1, 0, 0, 2],
      [0, 0, 1, 0, 0, 2],
      [0, 0, 1, 0, 0, 2]
    ]
  },
  {
    'id': 4,
    'name': "Corner Challenge",
    'description': "Use turns to reach the goal in the corner.",
    'start': { 'x': 1, 'y': 5, 'dir': 0 },
    'goals': [{ 'x': 4, 'y': 1 }],
    'allowedTools': ["F", "L", "TR", "TL", "J" , "D"],
    'heights': [
      [0, 0, 0, 0, 0, 0],
      [0, 3, 3, 3, 3, 0],
      [0, 2, 0, 0, 0, 0],
      [0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0]
    ]
  },
  {
    'id': 5,
    'name': "First Jump: The Step",
    'description': "Jump onto the raised tile and light all goals.",
    'start': { 'x': 0, 'y': 3, 'dir': 1 },
    'goals': [
      { 'x': 2, 'y': 3 },
      { 'x': 2, 'y': 1 },
      { 'x': 3, 'y': 1 },
      { 'x': 1, 'y': 1 },
    ],
    'heights': [
      [0, 0, 0, 0, 0, 0],
      [0, 4, 3, 2, 1, 0],
      [0, 0, 0, 0, 1, 0],
      [0, 0, 1, 0, 1, 0],
      [0, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0]
    ]
  },
  {
    'id': 6,
    'name': "Jumping Heights",
    'description': "Navigate varying heights to light all goals.",
    'start': { 'x': 2, 'y': 6, 'dir': 0 },
    'goals': [
      { 'x': 3, 'y': 3 },
      { 'x': 4, 'y': 3 },
      { 'x': 5, 'y': 6 },
      { 'x': 5, 'y': 0 },
    ],
    'heights': [
      [0, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 2, 3, 4, 2, 0, 0],
      [0, 0, 1, 0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ]
  },

  # --- INTERMEDIATE ---
  {
    'id': 7,
    'name': "The Center Pillar",
    'description': "A maze of single-step heights to light a central square of goals.",
    'start': { 'x': 3, 'y': 7, 'dir': 0 },
    'goals': [
      { 'x': 3, 'y': 6 }, { 'x': 3, 'y': 2 }, { 'x': 3, 'y': 5 }, { 'x': 3, 'y': 1 }, { 'x': 3, 'y': 4 }, { 'x': 3, 'y': 0 }, { 'x': 3, 'y': 3 },
      { 'x': 2, 'y': 6 }, { 'x': 2, 'y': 2 }, { 'x': 2, 'y': 5 }, { 'x': 2, 'y': 0 }, { 'x': 2, 'y': 3 }, { 'x': 2, 'y': 4 }, { 'x': 2, 'y': 1 },
      { 'x': 4, 'y': 0 }, { 'x': 4, 'y': 1 }, { 'x': 4, 'y': 6 }, { 'x': 4, 'y': 2 }, { 'x': 4, 'y': 5 }, { 'x': 4, 'y': 3 }, { 'x': 4, 'y': 4 }
    ],
    'heights': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
  },
  {
    'id': 8,
    'name': "The Grid Pattern",
    'description': "A grid of platforms separated by trenches. Light all 9 goals.",
    'start': { 'x': 0, 'y': 4, 'dir': 0 },
    'goals': [
      { 'x': 0, 'y': 2 }, { 'x': 0, 'y': 0 },
      { 'x': 2, 'y': 2 }, { 'x': 2, 'y': 0 }, { 'x': 2, 'y': 4 },
      { 'x': 4, 'y': 2 }, { 'x': 4, 'y': 0 }, { 'x': 4, 'y': 4 }
    ],
    'heights': [
      [1, 1, 1, 1, 1, 0],
      [1, 0, 1, 0, 1, 0],
      [1, 1, 1, 1, 1, 0],
      [1, 0, 1, 0, 1, 0],
      [0, 0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0, 0]
    ],
  },
  {
    'id': 9,
    'name': "The Square Frame",
    'description': "Light the entire square frame on two different heights.",
    'start': { 'x': 0, 'y': 5, 'dir': 1 },
    'goals': [
      { 'x': 1, 'y': 1 }, { 'x': 2, 'y': 1 }, { 'x': 3, 'y': 1 }, { 'x': 4, 'y': 1 },
      { 'x': 1, 'y': 2 }, { 'x': 1, 'y': 3 }, { 'x': 1, 'y': 4 },
      { 'x': 2, 'y': 4 }, { 'x': 3, 'y': 4 }, { 'x': 4, 'y': 4 },
      { 'x': 4, 'y': 3 }, { 'x': 4, 'y': 2 }
    ],
    'heights': [
      [0, 1, 0, 0, 1, 0],
      [1, 2, 1, 1, 2, 1],
      [0, 1, 0, 0, 1, 0],
      [0, 1, 0, 0, 1, 0],
      [1, 2, 1, 1, 2, 1],
      [0, 1, 0, 0, 1, 0]
    ]
  },
{
  'id': 10,
  'name': "The Ridge Walker",
  'description': "Navigate the narrow, winding path of varying heights.",
  'start': { 'x': 0, 'y': 7, 'dir': 1 },
  'goals': [
    { 'x': 7, 'y': 3 },
    { 'x': 0, 'y': 4 }
  ],
  'heights': [

    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 4, 3, 4, 2, 2],
    [2, 2, 2, 4, 2, 3, 2, 0],
    [0, 0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0]
  ],
  'gridSize': 8,
  'teleportLinks': {},
  'elevatorMeta': {}
},
  {
    'id': 11,
    'name': "Walled Stripes",
    'description': "A large map with stripes of platforms separated by trenches. Light every single goal tile.",
    'start': { 'x': 0, 'y': 9, 'dir': 1 },
    'goals': [
      { 'x': 0, 'y': 8 }, { 'x': 0, 'y': 4 }, { 'x': 1, 'y': 8 }, { 'x': 8, 'y': 8 }, { 'x': 7, 'y': 8 }, { 'x': 6, 'y': 8 }, { 'x': 5, 'y': 8 }, { 'x': 4, 'y': 8 }, { 'x': 3, 'y': 8 }, { 'x': 2, 'y': 8 }, { 'x': 9, 'y': 8 },
      { 'x': 0, 'y': 7 }, { 'x': 7, 'y': 6 }, { 'x': 7, 'y': 7 }, { 'x': 6, 'y': 7 }, { 'x': 5, 'y': 7 }, { 'x': 4, 'y': 7 }, { 'x': 3, 'y': 7 }, { 'x': 2, 'y': 7 }, { 'x': 1, 'y': 7 }, { 'x': 0, 'y': 6 },
      { 'x': 8, 'y': 7 }, { 'x': 6, 'y': 6 }, { 'x': 5, 'y': 6 }, { 'x': 4, 'y': 6 }, { 'x': 3, 'y': 6 }, { 'x': 2, 'y': 6 }, { 'x': 1, 'y': 6 }, { 'x': 8, 'y': 6 },
      { 'x': 4, 'y': 5 }, { 'x': 0, 'y': 5 }, { 'x': 9, 'y': 6 }, { 'x': 9, 'y': 7 },
      { 'x': 5, 'y': 5 }, { 'x': 3, 'y': 5 }, { 'x': 2, 'y': 5 }, { 'x': 1, 'y': 5 },
      { 'x': 9, 'y': 4 }, { 'x': 9, 'y': 5 }, { 'x': 8, 'y': 5 }, { 'x': 7, 'y': 5 }, { 'x': 6, 'y': 5 },
      { 'x': 1, 'y': 4 }, { 'x': 8, 'y': 4 }, { 'x': 7, 'y': 4 }, { 'x': 6, 'y': 4 }, { 'x': 5, 'y': 4 }, { 'x': 4, 'y': 4 }, { 'x': 3, 'y': 4 }, { 'x': 2, 'y': 4 },
      { 'x': 1, 'y': 9 }, { 'x': 9, 'y': 9 }, { 'x': 8, 'y': 9 }, { 'x': 7, 'y': 9 }, { 'x': 6, 'y': 9 }, { 'x': 5, 'y': 9 }, { 'x': 4, 'y': 9 }, { 'x': 3, 'y': 9 }, { 'x': 2, 'y': 9 }
    ],
    'heights': [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'gridSize': 10,
    'teleportLinks': {},
    'elevatorMeta': {}
  },
  {
    'id': 12,
    'name': "The Height Diamond",
    'description': "A symmetrical diamond shape requiring movement up and down multiple height levels to light all perimeter goals.",
    'start': { 'x': 3, 'y': 7, 'dir': 0 },
    'goals': [
      { 'x': 3, 'y': 3 }, { 'x': 3, 'y': 4 }, { 'x': 2, 'y': 5 }, { 'x': 1, 'y': 5 }, { 'x': 0, 'y': 5 }, { 'x': 5, 'y': 5 }, { 'x': 3, 'y': 5 },
      { 'x': 3, 'y': 2 }, { 'x': 4, 'y': 5 }, { 'x': 4, 'y': 2 }, { 'x': 6, 'y': 5 },
      { 'x': 0, 'y': 4 }, { 'x': 6, 'y': 4 },
      { 'x': 0, 'y': 3 }, { 'x': 6, 'y': 3 },
      { 'x': 0, 'y': 2 }, { 'x': 6, 'y': 2 }, { 'x': 5, 'y': 2 }, { 'x': 2, 'y': 2 }, { 'x': 1, 'y': 2 }
    ],
    'heights': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 2, 3, 4, 3, 2, 1, 0],
      [2, 0, 0, 3, 0, 0, 2, 0],
      [3, 0, 0, 2, 0, 0, 3, 0],
      [4, 3, 2, 1, 2, 3, 4, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'gridSize': 8,
    'teleportLinks': {},
    'elevatorMeta': {}
  },

  # --- ADVANCED & SPECIAL MECHANICS ---
  {
    'id': 13,
    'name': "Slippery Spiral",
    'description': "**ICE CHALLENGE**: You must spiral inward, using the rock walls to stop your uncontrolled slide, to reach the safe island in the middle.",
    'gridSize': 8,
    'start': { 'x': 0, 'y': 7, 'dir': 1 },
    'goals': [{ 'x': 4, 'y': 3 }],
    'heights': [
      [0, 0, 0, 0, 0, 0, 1, 0],
      [1, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0],
      [0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1]
    ],
    'iceTiles': [
      # Row 0
      { 'x': 0, 'y': 0 }, { 'x': 1, 'y': 0 }, { 'x': 2, 'y': 0 }, { 'x': 3, 'y': 0 }, { 'x': 4, 'y': 0 }, { 'x': 5, 'y': 0 }, { 'x': 7, 'y': 0 },
      # Row 1
      { 'x': 1, 'y': 1 }, { 'x': 2, 'y': 1 }, { 'x': 3, 'y': 1 }, { 'x': 4, 'y': 1 }, { 'x': 5, 'y': 1 }, { 'x': 6, 'y': 1 }, { 'x': 7, 'y': 1 },
      # Row 2
      { 'x': 0, 'y': 2 }, { 'x': 1, 'y': 2 }, { 'x': 2, 'y': 2 }, { 'x': 4, 'y': 2 }, { 'x': 5, 'y': 2 }, { 'x': 6, 'y': 2 }, { 'x': 7, 'y': 2 },
      # Row 3
      { 'x': 0, 'y': 3 }, { 'x': 1, 'y': 3 }, { 'x': 2, 'y': 3 }, { 'x': 3, 'y': 3 }, { 'x': 5, 'y': 3 }, { 'x': 6, 'y': 3 }, { 'x': 7, 'y': 3 },
      # Row 4
      { 'x': 0, 'y': 4 }, { 'x': 1, 'y': 4 }, { 'x': 2, 'y': 4 }, { 'x': 3, 'y': 4 }, { 'x': 4, 'y': 4 }, { 'x': 5, 'y': 4 }, { 'x': 6, 'y': 4 }, { 'x': 7, 'y': 4 },
      # Row 5
      { 'x': 0, 'y': 5 }, { 'x': 1, 'y': 5 }, { 'x': 2, 'y': 5 }, { 'x': 3, 'y': 5 }, { 'x': 5, 'y': 5 }, { 'x': 6, 'y': 5 }, { 'x': 7, 'y': 5 },
      # Row 6
      { 'x': 0, 'y': 6 }, { 'x': 2, 'y': 6 }, { 'x': 3, 'y': 6 }, { 'x': 4, 'y': 6 }, { 'x': 5, 'y': 6 }, { 'x': 6, 'y': 6 }, { 'x': 7, 'y': 6 },
      # Row 7
      { 'x': 1, 'y': 7 }, { 'x': 2, 'y': 7 }, { 'x': 3, 'y': 7 }, { 'x': 4, 'y': 7 }, { 'x': 5, 'y': 7 }, { 'x': 6, 'y': 7 }
    ]
  },
  {
    'id': 14,
    'name': "The Staircase Paradox",
    'description': "**LOGIC CHALLENGE**: You must jump down to the ice to gain movement, then use the stairs (Height 1 tiles) to climb the towers (Height 2 tiles).",
    'start': { 'x': 1, 'y': 1, 'dir': 1 },
    'goals': [
      { 'x': 7, 'y': 7 }
    ],
    'heights': [
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 2, 0, 0, 1, 2, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 1, 2, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 2, 3, 2]
    ],
    'gridSize': 8,
    'teleportLinks': {},
    'elevatorMeta': {},
    'iceTiles': [
      { 'x': 2, 'y': 1 }, { 'x': 3, 'y': 1 },
      { 'x': 1, 'y': 2 }, { 'x': 1, 'y': 3 },
      { 'x': 4, 'y': 2 }, { 'x': 4, 'y': 3 }, { 'x': 4, 'y': 4 },
      { 'x': 2, 'y': 4 }, { 'x': 3, 'y': 4 },
      { 'x': 4, 'y': 5 }, { 'x': 4, 'y': 6 },
      { 'x': 1, 'y': 0 }, { 'x': 2, 'y': 0 }, { 'x': 3, 'y': 0 }, { 'x': 4, 'y': 0 }, { 'x': 5, 'y': 0 }, { 'x': 6, 'y': 0 },
      { 'x': 0, 'y': 0 }, { 'x': 0, 'y': 1 }, { 'x': 0, 'y': 2 }, { 'x': 0, 'y': 3 }, { 'x': 0, 'y': 4 }, { 'x': 0, 'y': 5 }, { 'x': 0, 'y': 6 }, { 'x': 0, 'y': 7 }
    ]
  },
  {
    'id': 15,
    'name': "Slippery Pyramid",
    'description': "**ICE CHALLENGE**: Use the walls to align your slide and reach the pyramid goals.",
    'start': { 'x': 0, 'y': 7, 'dir': 1 },
    'goals': [
      { 'x': 3, 'y': 3 },
      { 'x': 4, 'y': 4 }
    ],
    'heights': [
      [1, 0, 0, 0, 0, 0, 0, 1],
      [0, 0, 0, 0, 0, 0, 1, 0],
      [0, 0, 1, 2, 1, 0, 0, 0],
      [0, 0, 2, 3, 2, 0, 0, 0],
      [0, 0, 1, 2, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [1, 0, 0, 0, 0, 0, 0, 1]
    ],
    'gridSize': 8,
    'iceTiles': [
      { 'x': 1, 'y': 0 }, { 'x': 2, 'y': 0 }, { 'x': 3, 'y': 0 }, { 'x': 4, 'y': 0 }, { 'x': 5, 'y': 0 }, { 'x': 6, 'y': 0 },
      { 'x': 0, 'y': 1 }, { 'x': 1, 'y': 1 }, { 'x': 2, 'y': 1 }, { 'x': 3, 'y': 1 }, { 'x': 4, 'y': 1 }, { 'x': 5, 'y': 1 }, { 'x': 7, 'y': 1 },
      { 'x': 0, 'y': 2 }, { 'x': 1, 'y': 2 }, { 'x': 5, 'y': 2 }, { 'x': 6, 'y': 2 }, { 'x': 7, 'y': 2 },
      { 'x': 0, 'y': 3 }, { 'x': 1, 'y': 3 }, { 'x': 5, 'y': 3 }, { 'x': 6, 'y': 3 }, { 'x': 7, 'y': 3 },
      { 'x': 0, 'y': 4 }, { 'x': 1, 'y': 4 }, { 'x': 5, 'y': 4 }, { 'x': 6, 'y': 4 }, { 'x': 7, 'y': 4 },
      { 'x': 0, 'y': 5 }, { 'x': 1, 'y': 5 }, { 'x': 2, 'y': 5 }, { 'x': 3, 'y': 5 }, { 'x': 4, 'y': 5 }, { 'x': 5, 'y': 5 }, { 'x': 6, 'y': 5 }, { 'x': 7, 'y': 5 },
      { 'x': 0, 'y': 6 }, { 'x': 1, 'y': 6 }, { 'x': 2, 'y': 6 }, { 'x': 3, 'y': 6 }, { 'x': 4, 'y': 6 }, { 'x': 5, 'y': 6 }, { 'x': 6, 'y': 6 }, { 'x': 7, 'y': 6 },
      { 'x': 1, 'y': 7 }, { 'x': 2, 'y': 7 }, { 'x': 3, 'y': 7 }, { 'x': 4, 'y': 7 }, { 'x': 5, 'y': 7 }, { 'x': 6, 'y': 7 }
    ]
  },

  # --- EXPERT TELEPORTATION ---
  {
    'id': 16,
    'name': "The Crossing",
    'description': "Use teleporters to cross the gaps and reach the isolated island.",
    'start': { 'x': 0, 'y': 0, 'dir': 2 },
    'goals': [
      { 'x': 6, 'y': 0 }
    ],
    'heights': [
      [3, 0, 0, 0, 0, 0, 3, 0],
      [3, 0, 0, 0, 0, 0, 3, 0],
      [3, 3, 0, 0, 0, 0, 3, 3],
      [0, 3, 0, 0, 0, 0, 0, 3],
      [0, 3, 0, 0, 0, 0, 0, 3],
      [0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 3, 3, 3, 0, 0, 0],
      [3, 3, 3, 0, 0, 0, 0, 0]
    ],
    'gridSize': 8,
    'teleportLinks': {
      "1,4": "0,7",
      "4,6": "7,4"
    },
    'elevatorMeta': {}
  },
  {
    'id': 17,
    'name': "Spiral Lock",
    'description': "Recursive arms with guaranteed height ramps.",
    'start': { 'x': 4, 'y': 4, 'dir': 0 },
    'goals': [
      { 'x': 4, 'y': 1 },
      { 'x': 6, 'y': 4 },
      { 'x': 4, 'y': 6 },
      { 'x': 1, 'y': 4 }
    ],
    'heights': [
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [1, 2, 1, 2, 1, 2, 1, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'gridSize': 8,
    'teleportLinks': {
      "4,0": "4,4",
      "7,4": "4,4",
      "4,7": "4,4",
      "0,4": "4,4"
    },
    'elevatorMeta': {}
  },
  {
    'id': 18,
    'name': "Descent Engine",
    'description': "Four arms. Four phases. Return to the center, but twisted.",
    'start': { 'x': 3, 'y': 3, 'dir': 0 },
    'goals': [
      { 'x': 3, 'y': 1 },
      { 'x': 5, 'y': 3 },
      { 'x': 3, 'y': 5 },
      { 'x': 1, 'y': 3 }
    ],
    'heights': [
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 4, 0, 0, 0, 0],
      [0, 0, 0, 6, 0, 0, 0, 0],
      [2, 4, 6, 8, 6, 4, 2, 0],
      [0, 0, 0, 6, 0, 0, 0, 0],
      [0, 0, 0, 4, 0, 0, 0, 0],
      [0, 0, 0, 2, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0]
    ],
    'gridSize': 8,
    'teleportLinks': {
      "3,0": "4,3",
      "6,3": "3,4",
      "3,6": "2,3",
      "0,3": "3,2"
    },
    'elevatorMeta': {}
  },
{
    "id": 19,
    "name": "Centrifuge",
    "description": "Design your own Lightbot puzzle!",
    "start": {
        "x": 2,
        "y": 2,
        "dir": 0
    },
    "goals": [
        {"x": 1, "y": 1},
        {"x": 1, "y": 4},
        {"x": 4, "y": 1},
        {"x": 4, "y": 4},
        {"x": 5, "y": 0},
        {"x": 0, "y": 0},
        {"x": 0, "y": 5},
        {"x": 5, "y": 5}
    ],
    "heights": [
        [2, 2, 2, 2, 2, 2],
        [2, 1, 1, 1, 1, 2],
        [2, 1, 0, 0, 1, 2],
        [2, 1, 0, 0, 1, 2],
        [2, 1, 1, 1, 1, 2],
        [2, 2, 2, 2, 2, 2]
    ],
    "gridSize": 6,
    "teleportLinks": {},
    "elevatorMeta": {
        "1,2": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "1,3": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "2,1": {"dx": -1, "dy": 0, "dir": "left", "type": "row"},
        "3,1": {"dx": -1, "dy": 0, "dir": "left", "type": "row"},
        "2,4": {"dx": 1, "dy": 0, "dir": "right", "type": "row"},
        "3,4": {"dx": 1, "dy": 0, "dir": "right", "type": "row"},
        "4,2": {"dx": 0, "dy": -1, "dir": "up", "type": "col"},
        "4,3": {"dx": 0, "dy": -1, "dir": "up", "type": "col"},
        "4,0": {"dx": -1, "dy": 0, "dir": "left", "type": "row"},
        "3,0": {"dx": -1, "dy": 0, "dir": "left", "type": "row"},
        "2,0": {"dx": -1, "dy": 0, "dir": "left", "type": "row"},
        "1,0": {"dx": -1, "dy": 0, "dir": "left", "type": "row"},
        "0,1": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "0,2": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "0,3": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "0,4": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "1,5": {"dx": 1, "dy": 0, "dir": "right", "type": "row"},
        "4,5": {"dx": 1, "dy": 0, "dir": "right", "type": "row"},
        "2,5": {"dx": 1, "dy": 0, "dir": "right", "type": "row"},
        "3,5": {"dx": 1, "dy": 0, "dir": "right", "type": "row"},
        "5,4": {"dx": 0, "dy": -1, "dir": "up", "type": "col"},
        "5,1": {"dx": 0, "dy": -1, "dir": "up", "type": "col"},
        "5,2": {"dx": 0, "dy": -1, "dir": "up", "type": "col"},
        "5,3": {"dx": 0, "dy": -1, "dir": "up", "type": "col"}
    },
    "iceTiles": []
},
{
    "id": 20,
    "name": "Frozen Canyon",
    "description": "Design your own Lightbot puzzle!",
    "start": {
        "x": 1,
        "y": 0,
        "dir": 1
    },
    "goals": [
        {"x": 1, "y": 6},
        {"x": 6, "y": 6},
        {"x": 6, "y": 3},
        {"x": 6, "y": 2},
        {"x": 6, "y": 1},
        {"x": 1, "y": 1},
        {"x": 1, "y": 2},
        {"x": 1, "y": 3}
    ],
    "heights": [
        [2, 0, 0, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 0, 0, 2],
        [2, 0, 0, 0, 0, 0, 0, 2],
        [2, 2, 2, 0, 0, 2, 2, 2],
        [2, 0, 0, 0, 0, 0, 0, 1],
        [2, 2, 2, 0, 0, 2, 2, 2]
    ],
    "gridSize": 8,
    "teleportLinks": {
        "3,7": "0,0",
        "7,6": "4,7"
    },
    "elevatorMeta": {
        "3,0": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "3,1": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "3,2": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "3,3": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "3,4": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "3,5": {"dx": 0, "dy": 1, "dir": "down", "type": "col"},
        "4,5": {"dx": 0, "dy": -1, "dir": "up", "type": "col"},
        "4,4": {"dx": 0, "dy": -1, "dir": "up", "type": "col"},
        "4,0": {"dx": 0, "dy": -1, "dir": "up", "type": "col"},
        "4,1": {"dx": 0, "dy": -1, "dir": "up", "type": "col"},
        "4,2": {"dx": 0, "dy": -1, "dir": "up", "type": "col"},
        "4,3": {"dx": 0, "dy": -1, "dir": "up", "type": "col"}
    },
    "iceTiles": [
        {"x": 2, "y": 6},
        {"x": 3, "y": 6},
        {"x": 4, "y": 6},
        {"x": 5, "y": 6},
        {"x": 0, "y": 1},
        {"x": 0, "y": 2},
        {"x": 0, "y": 3},
        {"x": 0, "y": 4},
        {"x": 0, "y": 5},
        {"x": 0, "y": 6},
        {"x": 0, "y": 7},
        {"x": 5, "y": 4},
        {"x": 5, "y": 0},
        {"x": 5, "y": 3},
        {"x": 5, "y": 1},
        {"x": 5, "y": 2},
        {"x": 6, "y": 0},
        {"x": 6, "y": 4},
        {"x": 2, "y": 0},
        {"x": 1, "y": 0},
        {"x": 2, "y": 1},
        {"x": 2, "y": 2},
        {"x": 1, "y": 4},
        {"x": 2, "y": 4},
        {"x": 2, "y": 3}
    ]
}
]