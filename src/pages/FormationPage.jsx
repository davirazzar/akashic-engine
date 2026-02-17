import React, { useState, useEffect } from "react";
import { UNITS } from "../utils/Constants";

export default function FormationPage() {
  const [grid, setGrid] = useState(Array(9).fill(null));
  const [active, setActive] = useState(null);
  const [combos, setCombos] = useState([]);

  // Layout order: Top(7,4,1), Mid(8,5,2), Bot(9,6,3)
  const layoutOrder = [6, 3, 0, 7, 4, 1, 8, 5, 2];

  useEffect(() => {
    const unitsOnBoard = grid.filter((u) => u !== null);
    const finalCombos = [];

    const simulateChain = (currentStatus, spentInThisChain) => {
      let bestSubChain = [];

      unitsOnBoard.forEach((unit) => {
        Object.entries(unit.skillset).forEach(([key, ability]) => {
          const uniqueId = `${unit.id}-${key}`;

          if (
            ability.type === "Passive" &&
            ability.chases === currentStatus &&
            !spentInThisChain.has(uniqueId)
          ) {
            const nextSpent = new Set(spentInThisChain).add(uniqueId);
            const result = simulateChain(ability.causes, nextSpent);

            if (result.length >= bestSubChain.length) {
              bestSubChain = [
                {
                  text: `${unit.name} passive ${ability.name} chases ${currentStatus}${ability.causes ? ` causing ${ability.causes}` : ""}`,
                  causes: ability.causes,
                },
                ...result,
              ];
            }
          }
        });
      });
      return bestSubChain;
    };

    unitsOnBoard.forEach((unit) => {
      Object.values(unit.skillset).forEach((ability) => {
        if (ability.type === "Active" || ability.type === "Basic") {
          const starterStep = {
            text: `${unit.name} use ${ability.name} causing ${ability.causes || "nothing"}`,
            isStarter: true,
            type: ability.type,
            unitId: unit.id,
            causes: ability.causes,
          };

          const chaseChain = ability.causes
            ? simulateChain(ability.causes, new Set())
            : [];
          finalCombos.push([starterStep, ...chaseChain]);
        }
      });
    });

    // Sort final results by Type and then Unit ID
    const sorted = finalCombos.sort((a, b) => {
      const priority = { Active: 1, Basic: 2 };
      if (priority[a[0].type] !== priority[b[0].type]) {
        return priority[a[0].type] - priority[b[0].type];
      }
      return a[0].unitId.localeCompare(b[0].unitId);
    });

    setCombos(sorted);
  }, [grid]);

  const handleSlot = (i) => {
    const next = [...grid];
    if (active) {
      const existing = next.findIndex((u) => u?.id === active.id);
      if (existing !== -1) next[existing] = null;
      next[i] = active;
      setActive(null);
    } else {
      next[i] = null;
    }
    setGrid(next);
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <div className="sidebar-left">
        <div>Formation</div>
      </div>

      <div className="main-container">
        <div className="grid-container">
          <div className="grid-purple">
            {layoutOrder.map((i) => (
              <div key={i} className="slot-item" onClick={() => handleSlot(i)}>
                <span>{i + 1}</span>
                {grid[i] && <b>{grid[i].name}</b>}
              </div>
            ))}
          </div>
        </div>

        {/* Combo */}
        <div className="panel-bottom">
          {combos.map((chain, groupIdx) => (
            <div key={groupIdx} className="combo-wrapper">
              <div className="combo-header">
                <span
                  className={`badge ${chain[0].type === "Active" ? "badge-active" : "badge-basic"}`}
                >
                  {chain[0].type}
                </span>
                <span className="combo-title">
                  COMBO {groupIdx + 1} ({chain.length} Hits)
                </span>
              </div>

              {chain.map((step, stepIdx) => (
                <div
                  key={stepIdx}
                  className={`combo-step ${step.isStarter ? "starter" : ""}`}
                >
                  {step.text}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Units Sidebar */}
      <div className="sidebar-right">
        <h3>UNITS</h3>
        {UNITS.map((u) => (
          <div
            key={u.id}
            className={`unit-card ${active?.id === u.id ? "selected" : ""}`}
            onClick={() => setActive(u)}
          >
            {u.name}
          </div>
        ))}
      </div>
    </div>
  );
}
