import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

interface Props {
  askForSelectScreen: (roomId: string | null) => void
  roomId: string | undefined
}

export default function Loading({ askForSelectScreen, roomId }: Props) {
  const requestedId = useParams().requestedId
  const gameId = useParams().id
  const currentRoomId = roomId || gameId || requestedId
  const navigate = useNavigate()

  useEffect(() => {
    if (currentRoomId) {
      askForSelectScreen(currentRoomId)
      navigate(`/game/${currentRoomId}`)
    } else {
      navigate(`/new-game`)
      askForSelectScreen(null)
    }
  }, [currentRoomId])

  return <div>Loading...</div>
}
