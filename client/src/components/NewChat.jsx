import React from 'react'

const NewChat = ({handleNew}) => {
  return (
    <button className='new-chat-button' onClick={handleNew}>+ New Chat</button>
  )
}

export default NewChat