import React, { useState } from 'react'
import { Settings, COLOR } from './shared-types'

function SelectScreen({
  settings,
  startGame,
}: {
  settings: Settings
  startGame: (color: COLOR, nickName: string) => void
}) {
  const [color, setColor] = useState<COLOR | null>(null)
  const [name, setName] = useState('')

  function initStartGame(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    event?.preventDefault()
    if (formIsValid) {
      startGame(color, name)
    } else {
      throw new Error('Error: Tried to start game without required inputs')
    }
  }

  const formIsValid = color && name.length > 0

  const renderColorButton = (colorTuple: [string, COLOR]) => {
    const [colorText, colorValue] = colorTuple
    return (
      <button
        key={colorValue}
        onClick={(event) => {
          event?.preventDefault()
          setColor(colorValue)
        }}
        style={{ backgroundColor: colorValue }}
        className={colorValue === color ? 'active-color' : ''}
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
          .filter(([, color]) => color !== COLOR.RED)
          .map(renderColorButton)}
      </div>
      <h3>Choose nickname</h3>
      <input
        className={name.length > 0 ? 'active' : ''}
        type="text"
        onInput={(event) => setName(event.currentTarget.value)}
      />
      <br></br>
      <button
        disabled={!formIsValid}
        className={formIsValid ? 'active' : 'inactive-submit'}
        onClick={(event) => initStartGame(event)}
      >
        Start game
      </button>
    </>
  )
}

export default SelectScreen
