import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings, Color, Input } from 'shared-types'
import { useParams } from 'react-router-dom'

interface Props {
  input: Input
  setInput: React.Dispatch<React.SetStateAction<Input>>
  settings: Settings
  roomId?: string
  joinRoom?: (roomId: string, input: Input) => void
  createRoom?: (input: Input) => void
}

export default function SelectScreen({ input, setInput, settings, roomId, joinRoom, createRoom }: Props) {
  const navigate = useNavigate()
  const paramId = useParams().id
  const currentRoomId = roomId || paramId

  useEffect(() => {
    if (currentRoomId) navigate(`/${currentRoomId}`)
  }, [currentRoomId, navigate])

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
    <div className="Section Gap-1">
      <div className="Input-wrapper Section Gap-2">
        <div className="Section Gap-1">
          <h3>Nickname</h3>
          <input
            className={input.name.length > 0 ? 'active' : ''}
            type="text"
            maxLength={settings.playerNameMaxLength}
            onInput={(event) => setInput({ ...input, name: event.currentTarget.value })}
          />
        </div>
        <div className="Section Gap-1">
          <h3>Snake color</h3>
          <div className="Colors-wrapper">
            {Object.entries(settings.color)
              .filter(([, color]) => color !== Color.Red)
              .map(renderColorButton)}
          </div>
        </div>
      </div>
      <div className="Section Gap-1">
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
    </div>
  )
}
