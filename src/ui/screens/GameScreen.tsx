import { GameCanvas } from '../components/GameCanvas.tsx';

interface GameScreenProps {
  levelId: string;
  mode: 'survival' | 'levels';
  onMenu: () => void;
  onNextLevel?: (levelId: string) => void;
}

export function GameScreen({ levelId, mode, onMenu, onNextLevel }: GameScreenProps) {
  return (
    <div data-testid="game-screen" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 0' }}>
      <GameCanvas levelId={levelId} mode={mode} onMenu={onMenu} onNextLevel={onNextLevel} />
    </div>
  );
}
