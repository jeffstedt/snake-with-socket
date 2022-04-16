import React, { useState } from 'react'
import { Settings, Color } from './shared-types'

interface Props {
  settings: Settings
  startGame: (color: Color, nickName: string) => void
}

export default function SelectScreen({ settings, startGame }: Props) {
  const [colorInput, setColorInput] = useState<Color | null>(null)
  const [nameInput, setNameInput] = useState('')

  function initStartGame(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event.preventDefault()
    if (formIsValid) {
      startGame(colorInput, nameInput)
    } else {
      throw new Error('Error: Tried to start game without required inputs')
    }
  }

  const formIsValid = colorInput && nameInput.length > 0

  const renderColorButton = ([colorText, colorValue]: [string, Color]) => {
    return (
      <button
        key={colorValue}
        onClick={(event) => {
          event?.preventDefault()
          setColorInput(colorValue)
        }}
        style={{ backgroundColor: colorValue }}
        className={colorValue === colorInput ? 'active-color' : ''}
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
        className={nameInput.length > 0 ? 'active' : ''}
        type="text"
        maxLength={settings.playerNameMaxLength}
        onInput={(event) => setNameInput(event.currentTarget.value)}
      />
      <br></br>
      <button disabled={!formIsValid} className={formIsValid ? 'active' : 'inactive-submit'} onClick={initStartGame}>
        Start game
      </button>
    </>
  )
}
