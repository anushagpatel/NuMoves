import React from 'react'

const Button = ({onClickHandler, value, title}) => {
  return (
    <button className={`px-3.5 py-1 border text-base hover:bg-blue hover:text-white`} onClick={onClickHandler} value={value}>
      {title}
    </button>
  )
}

export default Button
