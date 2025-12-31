def run_lightbot(level, programs):
    """
    Pure logic simulator that mirrors the frontend engine.
    Supports Teleport > Elevator > Ice priority logic with Momentum.
    """

    heights = level["heights"]
    start = level["start"]
    goals = {(g["x"], g["y"]) for g in level["goals"]}
    
    # Normalization for fast lookups
    ice_tiles = {(t["x"], t["y"]) for t in level.get("iceTiles", [])}

    GRID_SIZE = len(heights)

    # --- EARLY REJECT: NO GOALS ---
    if len(goals) == 0:
        return {
            "success": False,
            "reason": "NO_GOALS",
        }

    # ----------------------------------
    # TELEPORT DATA NORMALIZATION
    # ----------------------------------
    raw_links = level.get("teleportLinks") or {}
    teleport_links = {}

    for k, v in raw_links.items():
        # Accept either string "x,y" or dict {"to": "x,y"}
        dest = v.get("to") if isinstance(v, dict) else v
        if isinstance(dest, str):
            teleport_links[k] = dest

    # ----------------------------------
    # ELEVATOR META NORMALIZATION
    # ----------------------------------
    elevator_meta = level.get("elevatorMeta", {}) or {}

    # Normalize programs keys
    programs = {str(k).lower(): v for k, v in (programs or {}).items()}

    robot = {"x": start["x"], "y": start["y"], "dir": start["dir"]}
    lit = set()

    # Direction order matches frontend revert: 0=North, 1=East, 2=South, 3=West
    # 0(N): dx=0, dy=-1
    # 1(E): dx=1, dy=0
    # 2(S): dx=0, dy=1
    # 3(W): dx=-1, dy=0
    dirs = [(0, -1), (1, 0), (0, 1), (-1, 0)]

    def in_bounds(x, y):
        return 0 <= x < GRID_SIZE and 0 <= y < GRID_SIZE

    def get_h(x, y):
        return heights[y][x] if in_bounds(x, y) else None

    # -------------------------------
    # ELEVATOR VECTOR HELPER
    # -------------------------------
    def get_elevator_vector(x, y):
        key = f"{x},{y}"
        meta = elevator_meta.get(key)
        if not meta:
            return None

        # 1) Named direction
        d = meta.get("dir")
        if d:
            return {
                "left": (-1, 0),
                "right": (1, 0),
                "up": (0, -1),
                "down": (0, 1),
            }.get(d)

        # 2) Explicit dx/dy
        if "dx" in meta and "dy" in meta:
            dx = meta.get("dx", 0)
            dy = meta.get("dy", 0)
            if dx == 0 and dy == 0:
                return None
            return dx, dy

        # 3) Legacy type
        t = meta.get("type")
        if t == "row":
            return 1, 0
        if t == "col":
            return 0, 1

        return None

    # -------------------------------
    # LANDING LOGIC (Teleport > Elevator > Ice)
    # -------------------------------
    def resolve_landing(in_dx, in_dy):
        """
        The 'Landing Barrier'.
        Continually applies physics effects until stable.
        Uses Momentum (mom_dx, mom_dy) for ice/elevator logic.
        """
        safety = GRID_SIZE * GRID_SIZE * 4  # Safety cutout
        visited_states = set()  # To detect infinite loops
        
        # Initialize Momentum
        mom_dx = in_dx
        mom_dy = in_dy

        while safety > 0:
            safety -= 1
            x, y = robot["x"], robot["y"]
            key = f"{x},{y}"
            
            # Loop detection includes MOMENTUM to allow crossing paths
            state_key = f"{x},{y},{robot['dir']},{mom_dx},{mom_dy}"
            
            # Only trigger loop check if we are on active tiles
            is_ice = (x, y) in ice_tiles
            has_elevator = get_elevator_vector(x, y) is not None
            
            if (is_ice or has_elevator) and state_key in visited_states:
                # Infinite loop detected in physics
                break
            visited_states.add(state_key)

            moved = False

            # --- 1. PRIORITY: TELEPORT ---
            dest_key = teleport_links.get(key)
            if dest_key:
                try:
                    tx, ty = map(int, dest_key.split(","))
                    if in_bounds(tx, ty):
                        robot["x"], robot["y"] = tx, ty
                        moved = True
                        
                        # Teleport kills momentum
                        mom_dx = 0
                        mom_dy = 0
                        
                        visited_states.clear() # Reset history
                except Exception:
                    pass

            # --- 2. PRIORITY: ELEVATOR ---
            if not moved:
                vec = get_elevator_vector(x, y)
                if vec:
                    dx, dy = vec
                    nx, ny = x + dx, y + dy
                    
                    if in_bounds(nx, ny):
                        cur_h = get_h(x, y)
                        next_h = get_h(nx, ny)
                        if next_h is not None and next_h <= cur_h:
                            robot["x"], robot["y"] = nx, ny
                            moved = True
                            
                            # Elevator UPDATES momentum
                            mom_dx = dx
                            mom_dy = dy

            # --- 3. PRIORITY: ICE ---
            # Slide based on MOMENTUM, not robot facing direction
            if not moved and (x, y) in ice_tiles:
                if mom_dx != 0 or mom_dy != 0:
                    nx, ny = x + mom_dx, y + mom_dy

                    if in_bounds(nx, ny):
                        cur_h = get_h(x, y)
                        next_h = get_h(nx, ny)
                        
                        # Slide allowed on equal or lower height
                        if next_h is not None and next_h <= cur_h:
                            robot["x"], robot["y"] = nx, ny
                            moved = True
                        else:
                            # Hit wall -> stop momentum
                            mom_dx = 0
                            mom_dy = 0
                    else:
                        # Hit edge -> stop momentum
                        mom_dx = 0
                        mom_dy = 0

            if not moved:
                break
        
        return

    # -------------------------------
    # MOVEMENT & ACTIONS
    # -------------------------------
    def move(jump=False):
        dx, dy = dirs[robot["dir"]]
        nx = robot["x"] + dx
        ny = robot["y"] + dy

        if not in_bounds(nx, ny):
            return False

        h0 = get_h(robot["x"], robot["y"])
        h1 = get_h(nx, ny)
        if h1 is None:
            return False

        if not jump:
            # forward: flat only
            if h1 != h0:
                return False
        else:
            # jump logic
            if h1 == h0:
                return False
            if h1 > h0 + 1:
                return False

        robot["x"], robot["y"] = nx, ny
        
        # Trigger physics passing the MOVEMENT VECTOR as initial momentum
        resolve_landing(dx, dy)
        return True

    def light():
        pos = (robot["x"], robot["y"])
        if pos in goals:
            if pos in lit:
                lit.remove(pos)
            else:
                lit.add(pos)

    # -------------------------------
    # EXECUTION ENGINE
    # -------------------------------
    stack = [{"panel": "main", "ip": 0}]
    steps = 0
    MAX_STEPS = 5000

    # Initial Physics Check (Standing still = 0 momentum)
    resolve_landing(0, 0)

    while stack and steps < MAX_STEPS:
        steps += 1

        frame = stack[-1]
        cmds = programs.get(frame["panel"], [])

        if frame["ip"] >= len(cmds):
            stack.pop()
            continue

        cmd = cmds[frame["ip"]]
        frame["ip"] += 1

        if not cmd:
            continue

        if cmd == "F":
            move(False)
        elif cmd == "J":
            move(True)
        elif cmd == "TL":
            robot["dir"] = (robot["dir"] + 3) % 4
        elif cmd == "TR":
            robot["dir"] = (robot["dir"] + 1) % 4
        elif cmd == "L":
            light()
            if goals.issubset(lit):
                return {"success": True, "reason": "SUCCESS"}
        elif cmd in ("M1", "M2"):
            panel_name = cmd.lower()
            sub = programs.get(panel_name, [])
            if any(sub):
                stack.append({"panel": panel_name, "ip": 0})
        
        # Check success after every command
        if goals.issubset(lit):
            return {"success": True, "reason": "SUCCESS"}

    if not goals.issubset(lit):
        if steps >= MAX_STEPS:
            return {"success": False, "reason": "TIME_LIMIT_EXCEEDED"}
        return {"success": False, "reason": "GOALS_NOT_LIT"}

    return {"success": True, "reason": "SUCCESS"}