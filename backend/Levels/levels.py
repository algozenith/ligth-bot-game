# levels.py

GRID_SIZE = 6


def flat():
    return [[0] * GRID_SIZE for _ in range(GRID_SIZE)]


LEVELS = [
    # 1 — Forward & Light
    {
        "id": 1,
        "name": "First Steps",
        "description": "Move straight and light the goal.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [{"x": 3, "y": 5}],
        "heights": flat(),
    },

    # 2 — Two lights in a row
    {
        "id": 2,
        "name": "Two Goals",
        "description": "Light both goal tiles.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [
            {"x": 2, "y": 5},
            {"x": 4, "y": 5},
        ],
        "heights": flat(),
    },

    # 3 — Basic upward jump
    {
        "id": 3,
        "name": "First Jump Up",
        "description": "Jump onto the platform and light it.",
        "start": {"x": 1, "y": 5, "dir": 1},
        "goals": [{"x": 4, "y": 5}],
        "heights": [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 1, 1, 1],
            [0, 0, 0, 1, 1, 1],
        ],
    },

    # 4 — Staircase Up
    {
        "id": 4,
        "name": "Stepping Up",
        "description": "Climb the 1-2-2 staircase.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [{"x": 3, "y": 5}],
        "heights": [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 1, 2, 2, 0, 0],
            [0, 1, 2, 2, 0, 0],
            [0, 0, 1, 2, 0, 0],
        ],
    },

    # 5 — Single drop
    {
        "id": 5,
        "name": "Drop Down",
        "description": "Drop down a tall tower safely.",
        "start": {"x": 1, "y": 2, "dir": 2},
        "goals": [{"x": 1, "y": 5}],
        "heights": [
            [0, 0, 0, 0, 0, 0],
            [0, 2, 0, 0, 0, 0],
            [0, 2, 0, 0, 0, 0],
            [0, 1, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ],
    },

    # 6 — Turning corners
    {
        "id": 6,
        "name": "Around the Bend",
        "description": "Practice turning left and right.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [{"x": 5, "y": 4}],
        "heights": flat(),
    },

    # 7 — Two tower heights
    {
        "id": 7,
        "name": "Twin Towers",
        "description": "Two raised goals — plan jumps carefully.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [
            {"x": 3, "y": 4},
            {"x": 5, "y": 3},
        ],
        "heights": [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 1, 1, 0, 0],
            [0, 0, 1, 2, 2, 0],
            [0, 0, 0, 1, 2, 0],
            [0, 0, 0, 1, 1, 0],
            [0, 0, 0, 0, 0, 0],
        ],
    },

    # 8 — Long forward path
    {
        "id": 8,
        "name": "Side Path",
        "description": "Use M1 or M2 to repeat moves.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [{"x": 5, "y": 5}],
        "heights": flat(),
    },

    # 9 — Zigzag heights
    {
        "id": 9,
        "name": "Zigzag",
        "description": "Alternate jumps across the board.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [{"x": 5, "y": 2}],
        "heights": [
            [0, 0, 0, 0, 0, 0],
            [0, 1, 0, 2, 0, 3],
            [0, 1, 0, 2, 0, 3],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ],
    },

    # 10 — Back and forth
    {
        "id": 10,
        "name": "Backtrack",
        "description": "Visit both ends of the line.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [
            {"x": 0, "y": 5},
            {"x": 4, "y": 5},
        ],
        "heights": flat(),
    },

    # 11 — Height 3 tower
    {
        "id": 11,
        "name": "High Tower",
        "description": "Climb to height 3 using 1-step jumps.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [{"x": 3, "y": 3}],
        "heights": [
            [0, 0, 0, 0, 0, 0],
            [0, 1, 2, 3, 0, 0],
            [0, 1, 2, 3, 0, 0],
            [0, 0, 1, 2, 0, 0],
            [0, 0, 0, 1, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ],
    },

    # 12 — Branching paths
    {
        "id": 12,
        "name": "Split Paths",
        "description": "Two goals — choose a function strategy.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [
            {"x": 5, "y": 5},
            {"x": 5, "y": 3},
        ],
        "heights": flat(),
    },

    # 13 — Big staircase
    {
        "id": 13,
        "name": "Staircase",
        "description": "Up and down the big staircase.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [{"x": 5, "y": 0}],
        "heights": [
            [0, 1, 2, 3, 2, 1],
            [0, 1, 2, 3, 2, 1],
            [0, 1, 2, 3, 2, 1],
            [0, 1, 2, 3, 2, 1],
            [0, 1, 2, 3, 2, 1],
            [0, 1, 2, 3, 2, 1],
        ],
    },

    # 14 — Center island
    {
        "id": 14,
        "name": "Island",
        "description": "Jump onto the central island.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [{"x": 3, "y": 2}],
        "heights": [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 2, 2, 0, 0],
            [0, 0, 2, 3, 0, 0],
            [0, 0, 2, 2, 0, 0],
            [0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ],
    },

    # 15 — Everything combined
    {
        "id": 15,
        "name": "Final Challenge",
        "description": "Use all skills — turning, jumping, recursion.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [
            {"x": 5, "y": 5},
            {"x": 5, "y": 2},
            {"x": 2, "y": 1},
        ],
        "heights": [
            [0, 0, 1, 2, 2, 3],
            [0, 0, 1, 2, 2, 3],
            [0, 0, 1, 2, 2, 3],
            [0, 0, 0, 1, 1, 2],
            [0, 0, 0, 1, 1, 2],
            [0, 0, 0, 0, 0, 1],
        ],
    },

    # 16 — The Bridge
    {
        "id": 16,
        "name": "The Bridge",
        "description": "Cross a suspended platform.",
        "start": {"x": 0, "y": 4, "dir": 1},
        "goals": [{"x": 5, "y": 4}],
        "heights": [
            [0, 0, 1, 1, 1, 0],
            [0, 0, 1, 2, 1, 0],
            [0, 0, 1, 2, 1, 0],
            [0, 0, 1, 2, 1, 0],
            [0, 0, 1, 1, 1, 0],
            [0, 0, 0, 0, 0, 0],
        ],
    },

    # 17 — Deep Hole
    {
        "id": 17,
        "name": "Deep Hole",
        "description": "Jump over the pit.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [{"x": 5, "y": 5}],
        "heights": [
            [0, 0, 0, 0, 0, 0],
            [0, 0, 3, 3, 0, 0],
            [0, 0, 3, 3, 0, 0],
            [0, 0, 3, 3, 0, 0],
            [0, 0, 3, 3, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ],
    },

    # 18 — The Corridor
    {
        "id": 18,
        "name": "The Corridor",
        "description": "Navigate a narrow corridor.",
        "start": {"x": 0, "y": 3, "dir": 1},
        "goals": [{"x": 5, "y": 3}],
        "heights": [
            [0, 3, 3, 3, 3, 0],
            [0, 3, 1, 1, 3, 0],
            [0, 3, 1, 1, 3, 0],
            [0, 3, 1, 1, 3, 0],
            [0, 3, 3, 3, 3, 0],
            [0, 0, 0, 0, 0, 0],
        ],
    },

    # 19 — Twin Islands
    {
        "id": 19,
        "name": "Twin Islands",
        "description": "Two goals on separate islands.",
        "start": {"x": 1, "y": 5, "dir": 1},
        "goals": [
            {"x": 4, "y": 3},
            {"x": 1, "y": 1},
        ],
        "heights": [
            [0, 0, 0, 0, 0, 0],
            [0, 2, 2, 0, 0, 0],
            [0, 2, 3, 0, 0, 0],
            [0, 0, 0, 0, 2, 2],
            [0, 0, 0, 0, 2, 3],
            [0, 0, 0, 0, 0, 0],
        ],
    },

    # 20 — Pyramid
    {
        "id": 20,
        "name": "Pyramid",
        "description": "Climb the pyramid peak.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [{"x": 3, "y": 2}],
        "heights": [
            [0, 1, 2, 3, 2, 1],
            [0, 1, 2, 3, 2, 1],
            [0, 1, 2, 3, 2, 1],
            [0, 1, 2, 3, 2, 1],
            [0, 1, 2, 3, 2, 1],
            [0, 1, 2, 3, 2, 1],
        ],
    },

    # 21 — The Loop
    {
        "id": 21,
        "name": "The Loop",
        "description": "Use recursion or function calls.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [
            {"x": 2, "y": 5},
            {"x": 4, "y": 5},
        ],
        "heights": flat(),
    },

    # 22 — The Divide
    {
        "id": 22,
        "name": "The Divide",
        "description": "Choose left path or right path.",
        "start": {"x": 3, "y": 5, "dir": 0},
        "goals": [
            {"x": 1, "y": 1},
            {"x": 5, "y": 1},
        ],
        "heights": [
            [0, 1, 2, 0, 2, 1],
            [0, 1, 2, 0, 2, 1],
            [0, 1, 2, 0, 2, 1],
            [0, 1, 2, 0, 2, 1],
            [0, 1, 2, 0, 2, 1],
            [0, 1, 2, 0, 2, 1],
        ],
    },

    # 23 — Tower Valley
    {
        "id": 23,
        "name": "Tower Valley",
        "description": "A valley between two towers.",
        "start": {"x": 0, "y": 3, "dir": 1},
        "goals": [{"x": 5, "y": 3}],
        "heights": [
            [3, 2, 1, 0, 1, 2],
            [3, 2, 1, 0, 1, 2],
            [3, 2, 1, 0, 1, 2],
            [3, 2, 1, 0, 1, 2],
            [3, 2, 1, 0, 1, 2],
            [3, 2, 1, 0, 1, 2],
        ],
    },

    # 24 — Mastery
    {
        "id": 24,
        "name": "Mastery",
        "description": "The true final challenge.",
        "start": {"x": 0, "y": 5, "dir": 1},
        "goals": [
            {"x": 5, "y": 5},
            {"x": 5, "y": 3},
            {"x": 3, "y": 1},
            {"x": 1, "y": 0},
        ],
        "heights": [
            [0, 1, 2, 3, 2, 1],
            [0, 1, 2, 3, 2, 1],
            [1, 2, 3, 3, 3, 2],
            [2, 3, 3, 1, 1, 0],
            [1, 2, 1, 0, 0, 0],
            [0, 0, 0, 0, 0, 0],
        ],
    },
]
