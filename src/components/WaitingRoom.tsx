import Leaderboard from './Leaderboard'
import { Player, Settings } from 'shared-types'
import { useParams } from 'react-router-dom'
import { useState } from 'react'

interface Props {
  socketId: string
  settings: Settings
  players: Player[]
  ready: (playerId: string, roomId: string) => void
}

function WaitingRoom({ socketId, settings, players, ready }: Props) {
  const [snackbar, setSnackbar] = useState<{ show: boolean; text: string }>({ show: false, text: '' })
  const currentRoomId = useParams().id || ''
  const visibilityClass = snackbar.show ? 'v-visible' : 'v-hidden'
  const snackbarClasses = ['snackbar', visibilityClass].join(' ')

  async function copyUrlToClipboard() {
    const { clipboard } = navigator
    const clipboardResult = await clipboard
      .writeText(window.location.href)
      .then(() => clipboard.readText())
      .catch((err) => {
        throw new Error('Enable to share room', err)
      })

    if (clipboardResult) {
      setSnackbar({ show: true, text: clipboardResult })
      setTimeout(() => setSnackbar({ show: false, text: '' }), 3000)
    }
  }

  return (
    <div className="Ui-wrapper" style={{ height: `${settings.canvasSize}px` }}>
      <div className="Sidebar-wrapper">
        <button onClick={() => ready(socketId, currentRoomId)}>Ready</button>
        <button onClick={copyUrlToClipboard}>Share game</button>
        {
          <div className={snackbarClasses}>
            <p>
              <u>{snackbar.text}</u> is now copied to clipboard
            </p>
          </div>
        }
      </div>
      <div className="Sidebar-wrapper">
        <Leaderboard players={players} socketId={socketId} />
      </div>
    </div>
  )
}

export default WaitingRoom
