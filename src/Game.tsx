import Canvas from './Canvas'
import Leaderboard from './Leaderboard'
import { Player, Fruit, Settings } from './shared-types'

interface Props {
  socketId: string
  players: Player[]
  fruit: Fruit
  settings: Settings
  exitGame: () => void
}

function Game({ socketId, players, fruit, settings, exitGame }: Props) {
  function initExitGame(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault()
    exitGame()
  }

  return (
    <div className="Ui-wrapper">
      <div className="Sidebar-wrapper">
        <Leaderboard players={players} socketId={socketId} />
        <button onClick={initExitGame}>Exit game</button>
      </div>
      <Canvas players={players} fruit={fruit} settings={settings} />
    </div>
  )
}

export default Game
