// src/components/RightSide/RightSidebar/RightSidebar.js
import ProgramGrid from "../ProgramGrid/ProgramGrid";
import CommandPalette from "../CommandPalette/CommandPalette";
import "./RightSidebar.css";

export default function RightSidebar({
  programs,
  activeProgram,
  execPointer,
  handleCellClick,
  selectedTool,
  setSelectedTool,
  clearActiveProgram,
  clearAllPrograms,
  isRunning,

  level,          // ⭐ REQUIRED (passed from TutorialPage)
}) {
  const allowedTools = level?.allowedTools || null; // safety

  return (
    <div className="right-sidebar">

      {/* MAIN */}
      <ProgramGrid
        title="MAIN"
        panelId="main"
        commands={programs.main}
        activeProgram={activeProgram}
        execPointer={execPointer}
        onCellClick={handleCellClick}

        // ⭐ NEW
        selectedTool={selectedTool}
        allowedTools={allowedTools}
      />

      {/* M1 */}
      <ProgramGrid
        title="F1"
        panelId="m1"
        commands={programs.m1}
        activeProgram={activeProgram}
        execPointer={execPointer}
        onCellClick={handleCellClick}

        // ⭐ NEW
        selectedTool={selectedTool}
        allowedTools={allowedTools}
      />

      {/* M2 */}
      <ProgramGrid
        title="F2"
        panelId="m2"
        commands={programs.m2}
        activeProgram={activeProgram}
        execPointer={execPointer}
        onCellClick={handleCellClick}

        // ⭐ NEW
        selectedTool={selectedTool}
        allowedTools={allowedTools}
      />

      {/* COMMAND PALETTE */}
      <CommandPalette
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        onClearActive={clearActiveProgram}
        onClearAll={clearAllPrograms}
        isRunning={isRunning}

        // ⭐ NEW
        allowedTools={allowedTools}
      />

    </div>
  );
}
