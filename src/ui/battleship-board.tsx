import { useState } from "react";

export interface Ship {
  id: string;
  shipType: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  sunk: boolean;
}

export interface Guess {
  id: string;
  x: number;
  y: number;
  result: "hit" | "miss" | "sunk";
  hitShipId?: string;
}

interface BattleshipBoardProps {
  size?: number;
  ships?: Ship[];
  guesses?: Guess[];
  isOpponentBoard?: boolean;
  onCellClick?: (x: number, y: number) => void;
  placingShip?: {
    type: string;
    length: number;
    orientation: "horizontal" | "vertical";
  };
  onShipPlace?: (startX: number, startY: number, endX: number, endY: number) => void;
  isMyTurn?: boolean;
  disabled?: boolean;
}

const SHIP_SIZES: Record<string, number> = {
  carrier: 5,
  battleship: 4,
  cruiser: 3,
  submarine: 3,
  destroyer: 2,
};

export function BattleshipBoard({
  size = 10,
  ships = [],
  guesses = [],
  isOpponentBoard = false,
  onCellClick,
  placingShip,
  onShipPlace,
  isMyTurn = false,
  disabled = false,
}: BattleshipBoardProps) {
  const [hoveredCells, setHoveredCells] = useState<Array<{ x: number; y: number }>>([]);

  const getCellState = (x: number, y: number) => {
    const guess: Guess | undefined = guesses.find(g => g.x === x && g.y === y);
    if (guess) {
      return guess.result;
    }

    if (!isOpponentBoard) {
      const ship: Ship | undefined = ships.find(s => 
        x >= Math.min(s.startX, s.endX) && 
        x <= Math.max(s.startX, s.endX) &&
        y >= Math.min(s.startY, s.endY) && 
        y <= Math.max(s.startY, s.endY)
      );
      if (ship) {
        return ship.sunk ? "sunk-ship" : "ship";
      }
    }

    return "empty";
  };

  const getCellClass = (x: number, y: number) => {
    const state: string = getCellState(x, y);
    const isHovered: boolean = hoveredCells.some(cell => cell.x === x && cell.y === y);
    
    let baseClass: string = "w-8 h-8 border border-gray-300 flex items-center justify-center text-xs font-semibold cursor-pointer transition-colors";
    
    if (disabled) {
      baseClass += " cursor-not-allowed opacity-50";
    } else if (placingShip && onShipPlace) {
      baseClass += " hover:bg-blue-100";
      if (isHovered) {
        baseClass += " bg-blue-200";
      }
    } else if (isOpponentBoard && isMyTurn && onCellClick && state === "empty") {
      baseClass += " hover:bg-red-100";
    }

    switch (state) {
      case "hit":
        return `${baseClass} bg-red-500 text-white`;
      case "miss":
        return `${baseClass} bg-blue-300 text-white`;
      case "sunk":
      case "sunk-ship":
        return `${baseClass} bg-red-700 text-white`;
      case "ship":
        return `${baseClass} bg-gray-600 text-white`;
      default:
        return `${baseClass} bg-gray-100 hover:bg-gray-200`;
    }
  };

  const getCellContent = (x: number, y: number) => {
    const state: string = getCellState(x, y);
    switch (state) {
      case "hit":
        return "×";
      case "miss":
        return "○";
      case "sunk":
      case "sunk-ship":
        return "☠";
      case "ship":
        return "■";
      default:
        return "";
    }
  };

  const handleCellHover = (x: number, y: number) => {
    if (!placingShip) return;

    const cells: Array<{ x: number; y: number }> = [];
    const length: number = placingShip.length;

    if (placingShip.orientation === "horizontal") {
      for (let i = 0; i < length; i++) {
        if (x + i < size) {
          cells.push({ x: x + i, y });
        }
      }
    } else {
      for (let i = 0; i < length; i++) {
        if (y + i < size) {
          cells.push({ x, y: y + i });
        }
      }
    }

    setHoveredCells(cells);
  };

  const handleCellClick = (x: number, y: number) => {
    if (disabled) return;

    if (placingShip && onShipPlace) {
      const length: number = placingShip.length;
      let endX: number = x;
      let endY: number = y;

      if (placingShip.orientation === "horizontal") {
        endX = x + length - 1;
      } else {
        endY = y + length - 1;
      }

      if (endX < size && endY < size) {
        onShipPlace(x, y, endX, endY);
      }
    } else if (onCellClick && (isOpponentBoard || !isOpponentBoard)) {
      onCellClick(x, y);
    }
  };

  return (
    <div className="inline-block">
      <div className="grid grid-cols-11 gap-0 border-2 border-gray-400">
        <div className="w-8 h-8"></div>
        {Array.from({ length: size }, (_, i) => (
          <div key={i} className="w-8 h-8 bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-semibold">
            {i + 1}
          </div>
        ))}
        
        {Array.from({ length: size }, (_, y) => (
          <>
            <div key={`row-${y}`} className="w-8 h-8 bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-semibold">
              {String.fromCharCode(65 + y)}
            </div>
            {Array.from({ length: size }, (_, x) => (
              <div
                key={`${x}-${y}`}
                className={getCellClass(x, y)}
                onClick={() => handleCellClick(x, y)}
                onMouseEnter={() => handleCellHover(x, y)}
                onMouseLeave={() => setHoveredCells([])}
              >
                {getCellContent(x, y)}
              </div>
            ))}
          </>
        ))}
      </div>
    </div>
  );
}