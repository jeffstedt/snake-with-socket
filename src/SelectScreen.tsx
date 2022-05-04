import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Color, Input } from './shared-types'
import { useParams } from 'react-router-dom'

interface Props {
  settings: Settings
  roomId?: string
  input: Input
  setInput: React.Dispatch<React.SetStateAction<Input>>
  startGame?: (input: Input) => void
  joinRoom?: (roomId: string, input: Input) => void
  createRoom?: (input: Input) => void
}

export default function SelectScreen({ settings, roomId, input, setInput, startGame, joinRoom, createRoom }: Props) {
  const navigate = useNavigate()
  const paramId = useParams().id
  const currentRoomId = roomId || paramId

  useEffect(() => {
    if (currentRoomId) navigate(`/${currentRoomId}`)
  }, [currentRoomId, navigate])

  function initStartGame(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault()
    if (startGame && formIsValid) {
      startGame(input)
    } else {
      throw new Error('Error: Tried to start game without required inputs')
    }
  }

  function initCreateRoom(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault()
    if (createRoom && formIsValid) {
      createRoom(input)
    } else {
      throw new Error('Error: Tried to start game without required inputs')
    }
  }

  function initJoinRoom(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault()
    if (joinRoom && formIsValid && currentRoomId) {
      joinRoom(currentRoomId, input)
    } else {
      throw new Error('Error: Tried to start game without required inputs')
    }
  }

  const formIsValid = input.color && input.name.length > 0

  const renderColorButton = ([colorText, colorValue]: [string, Color]) => {
    return (
      <button
        key={colorValue}
        onClick={(event) => {
          event?.preventDefault()
          setInput({ ...input, color: colorValue })
        }}
        style={{ backgroundColor: colorValue }}
        className={colorValue === input.color ? 'active-color' : ''}
      >
        {colorText}
      </button>
    )
  }

  return (
    <>
      <h3>Choose color</h3>
      <div style={{ display: 'flex' }}>
        {Object.entries(settings.color)
          .filter(([, color]) => color !== Color.Red)
          .map(renderColorButton)}
      </div>
      <h3>Choose nickname</h3>
      <input
        className={input.name.length > 0 ? 'active' : ''}
        type="text"
        maxLength={settings.playerNameMaxLength}
        onInput={(event) => setInput({ ...input, name: event.currentTarget.value })}
      />
      <br></br>
      <div style={{ display: 'flex' }}>
        {joinRoom && (
          <button disabled={!formIsValid} className={formIsValid ? 'active' : 'inactive-submit'} onClick={initJoinRoom}>
            Join game
          </button>
        )}
        {createRoom && (
          <button
            disabled={!formIsValid}
            className={formIsValid ? 'active' : 'inactive-submit'}
            onClick={initCreateRoom}
          >
            Create game
          </button>
        )}
      </div>
      {startGame && (
        <button disabled={!formIsValid} className={formIsValid ? 'active' : 'inactive-submit'} onClick={initStartGame}>
          Ready
        </button>
      )}
    </>
  )
}
