import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Color } from './shared-types'

export interface Input {
  color: Color | null
  name: string
}

interface Props {
  input: Input
  setInput: React.Dispatch<React.SetStateAction<Input>>
  settings: Settings | null
  roomId: string | null
  startGame?: (color: Color, name: string) => void
  joinRoom?: (roomId: string) => void
  createRoom?: (color: Color, name: string) => void
}

export default function SelectScreen({ input, setInput, settings, roomId, startGame, joinRoom, createRoom }: Props) {
  const navigate = useNavigate()

  useEffect(() => {
    if (roomId !== null) navigate(`/${roomId}`)
  }, [roomId, navigate])

  function initStartGame(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault()
    if (startGame && formIsValid && input.color) {
      startGame(input.color, input.name)
    } else {
      throw new Error('Error: Tried to start game without required inputs')
    }
  }

  function initCreateRoom(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault()
    if (createRoom && formIsValid && input.color) {
      createRoom(input.color, input.name)
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

  if (!settings) {
    return <div>Could not fetch settings</div>
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
          <button
            disabled={!formIsValid}
            className={formIsValid ? 'active' : 'inactive-submit'}
            onClick={() => joinRoom('')}
          >
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
