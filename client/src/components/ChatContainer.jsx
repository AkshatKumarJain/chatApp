import { useEffect, useRef, useState } from 'react'
import assets from '../assets/assets'
import { formatMessageTime } from '../lib/utils'
import { useAuth } from '../context/useAuth'
import { api, endpoints } from '../lib/chatApi'

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = reject
  reader.readAsDataURL(file)
})

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const scrollEnd = useRef()
  const { user, socket, onlineUsers } = useAuth()
  const [messageText, setMessageText] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState('')
  const currentUserId = user?._id
  const isSelectedUserOnline = selectedUser?._id && onlineUsers.includes(selectedUser._id)

  useEffect(() => {
    if (!selectedUser?._id) {
      return
    }

    const fetchMessages = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await api.get(endpoints.messages(selectedUser._id))
        setMessages(response.data.messages || [])
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load messages.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMessages()
  }, [selectedUser?._id])

  useEffect(() => {
    if (!socket || !selectedUser?._id) {
      return
    }

    const handleNewMessage = (newMessage) => {
      const belongsToOpenChat = newMessage.senderId === selectedUser._id || newMessage.receiverId === selectedUser._id

      if (!belongsToOpenChat) {
        return
      }

      setMessages((previousMessages) => {
        if (previousMessages.some((message) => message._id === newMessage._id)) {
          return previousMessages
        }

        return [...previousMessages, newMessage]
      })

      if (newMessage.senderId === selectedUser._id) {
        api.put(endpoints.markMessage(newMessage._id)).catch(() => {})
      }
    }

    socket.on('newMessage', handleNewMessage)

    return () => {
      socket.off('newMessage', handleNewMessage)
    }
  }, [socket, selectedUser?._id])

  useEffect(() => {
    if (scrollEnd.current) {
      scrollEnd.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, selectedUser])

  const appendSentMessage = (response) => {
    const sentMessage = response.data.newMessage || response.data.message

    if (sentMessage?._id) {
      setMessages((previousMessages) => [...previousMessages, sentMessage])
    }
  }

  const handleSendMessage = async (event) => {
    event.preventDefault()

    if (!messageText.trim() || !selectedUser || isSending) {
      return
    }

    setIsSending(true)
    setError('')

    try {
      const text = messageText.trim()
      setMessageText('')
      const response = await api.post(endpoints.sendMessage(selectedUser._id), { text })
      appendSentMessage(response)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send message.')
    } finally {
      setIsSending(false)
    }
  }

  const handleImageMessage = async (event) => {
    const file = event.target.files?.[0]

    if (!file || !selectedUser || isSending) {
      return
    }

    setIsSending(true)
    setError('')

    try {
      const image = await readFileAsDataUrl(file)
      const response = await api.post(endpoints.sendMessage(selectedUser._id), { image })
      appendSentMessage(response)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send image.')
    } finally {
      event.target.value = ''
      setIsSending(false)
    }
  }

  return selectedUser ? (
    <div className="h-full overflow-hidden relative backdrop-blur-lg">
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500">
        <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className="w-8 aspect-square rounded-full" />
        <p className="flex-1 text-lg text-white flex items-center gap-2 min-w-0">
          <span className="truncate">{selectedUser.fullName}</span>
          {isSelectedUserOnline && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>}
        </p>
        <button onClick={() => setSelectedUser(null)} className="md:hidden">
          <img src={assets.arrow_icon} alt="Back" className="max-w-7" />
        </button>
        <img src={assets.help_icon} alt="" className="max-md:hidden max-w-5" />
      </div>

      <div className="flex flex-col h-[calc(100%-124px)] overflow-y-scroll p-3 pb-6">
        {isLoading && <p className="text-sm text-gray-400 text-center mt-8">Loading messages...</p>}
        {error && <p className="text-sm text-red-300 text-center mt-4">{error}</p>}
        {!isLoading && messages.map((msg) => (
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
        {!isLoading && messages.length === 0 && !error && <p className="text-sm text-gray-400 text-center mt-8">No messages yet.</p>}
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
        <button type="submit" disabled={!messageText.trim() || isSending} className="disabled:opacity-50">
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
