import Canvas from './Canvas'
import Leaderboard from './Leaderboard'
import { Player, Fruit, Settings } from 'shared-types'

interface Props {
  socketId: UUID
  settings: Settings
  players: Player[]
  fruit: Fruit | null
  exitGame: () => void
}

function Game({ socketId, settings, players, fruit, exitGame }: Props) {
  function initExitGame(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault()
    exitGame()
  }

  return (
    <div className="Ui-wrapper">
      <Canvas players={players} fruit={fruit} settings={settings} />
      <div className="Sidebar-wrapper">
        <Leaderboard players={players} socketId={socketId} />
        <button onClick={initExitGame}>Exit game</button>
      </div>
    </div>
  )
}

export default Game
