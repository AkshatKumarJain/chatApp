import { useEffect, useMemo, useRef, useState } from 'react'
import assets, { messagesDummyData } from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { useAuth } from '../context/useAuth'

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const scrollEnd = useRef()
  const { user } = useAuth()
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState(messagesDummyData)
  const currentUserId = user?._id || 'current-user'

  const activeMessages = useMemo(() => messages, [messages])

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [activeMessages, selectedUser])

  const handleSendMessage = (event) => {
    event.preventDefault()

    if (!messageText.trim() || !selectedUser) {
      return
    }

    const nextMessage = {
      _id: crypto.randomUUID(),
      senderId: currentUserId,
      receiverId: selectedUser._id,
      text: messageText.trim(),
      seen: false,
      createdAt: new Date().toISOString(),
    }

    setMessages((previousMessages) => [...previousMessages, nextMessage])
    setMessageText('')
  }

  const handleImageMessage = (event) => {
    const file = event.target.files?.[0]

    if (!file || !selectedUser) {
      return
    }

    const nextMessage = {
      _id: crypto.randomUUID(),
      senderId: currentUserId,
      receiverId: selectedUser._id,
      image: URL.createObjectURL(file),
      seen: false,
      createdAt: new Date().toISOString(),
    }

    setMessages((previousMessages) => [...previousMessages, nextMessage])
    event.target.value = ''
  }

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 aspect-square rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2 min-w-0">
          <span className="truncate">{selectedUser.fullName}</span>
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>
        </p>
        <button onClick={() => setSelectedUser(null)} className="md:hidden">
          <img src={assets.arrow_icon} alt="Back" className="max-w-7" />
        </button>
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      <div className="flex flex-col h-[calc(100%-124px)] overflow-y-scroll p-3 pb-6">
        {activeMessages.map((msg) => (
          <div key={msg._id} className={`flex items-end gap-2 ${msg.senderId === currentUserId ? 'justify-end' : 'justify-end flex-row-reverse'}`}>
            {msg.image ? (
              <img src={msg.image} alt="" className="max-w-[230px] border border-gray-700 rounded-lg overflow-hidden mb-8" />
            ) : (
              <p className={`p-2 max-w-[240px] md:text-sm font-light rounded-lg mb-8 break-words bg-violet-500/30 text-white ${msg.senderId === currentUserId ? 'rounded-br-none' : 'rounded-bl-none'}`}>
                {msg.text}
              </p>
            )}
            <div className="text-center text-xs">
              <img
                src={msg.senderId === currentUserId ? user?.profilePic || assets.avatar_icon : selectedUser.profilePic || assets.avatar_icon}
                alt=""
                className="w-7 aspect-square rounded-full"
              />
              <p className="text-gray-500">{formatMessageTime(msg.createdAt)}</p>
            </div>
          </div>
        ))}
        <div ref={scrollEnd}></div>
      </div>

      <form onSubmit={handleSendMessage} className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input
            value={messageText}
            onChange={(event) => setMessageText(event.target.value)}
            type="text"
            placeholder="Send a message"
            className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-white placeholder-gray-400 bg-transparent"
          />
          <input onChange={handleImageMessage} type="file" id="image" accept="image/png, image/jpeg" hidden />
          <label htmlFor="image">
            <img src={assets.gallery_icon} alt="Attach" className="w-5 mr-2 cursor-pointer" />
          </label>
        </div>
        <button type="submit" disabled={!messageText.trim()} className="disabled:opacity-50">
          <img src={assets.send_button} alt="Send" className="w-7 cursor-pointer" />
        </button>
      </form>
    </div>
  ) : (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/10 max-md:hidden">
      <img src={assets.logo_icon} alt="" className="max-w-16" />
      <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer
