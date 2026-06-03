import { useEffect, useMemo, useState } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import { api, endpoints } from '../lib/chatApi'

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const navigate = useNavigate()
  const { logout, onlineUsers } = useAuth()
  const [search, setSearch] = useState('')
  const [users, setUsers] = useState([])
  const [unseenMessages, setUnseenMessages] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      setError('')

      try {
        const response = await api.get(endpoints.users)
        setUsers(response.data.users || [])
        setUnseenMessages(response.data.unseenMessages || {})
      } catch (requestError) {
        setError(requestError.response?.data?.message || 'Unable to load users.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return users
    }

    return users.filter((user) =>
      user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    )
  }, [search, users])

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    setUnseenMessages((previous) => ({
      ...previous,
      [user._id]: 0,
    }))
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 overflow-y-scroll text-white ${selectedUser ? 'max-md:hidden' : ''}`}>
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img src={assets.logo} alt="QuickChat" className="max-w-40" />
          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt="Menu" className="max-h-5 cursor-pointer" />
            <div className="absolute top-full right-0 z-20 w-36 p-4 rounded-md bg-[#282142] border border-gray-600 text-gray-100 hidden group-hover:block">
              <button onClick={() => navigate('/profile')} className="block w-full text-left cursor-pointer text-sm">
                Edit profile
              </button>
              <hr className="my-3 border-t border-gray-500" />
              <button onClick={handleLogout} className="block w-full text-left cursor-pointer text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
        <div className="bg-[#282142] rounded-full flex items-center gap-2 py-3 px-3 mt-5">
          <img src={assets.search_icon} alt="Search" className="w-3" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            type="text"
            className="bg-transparent border-none outline-none text-white text-xs placeholder-[#c8c8c8] flex-1"
            placeholder="Search user..."
          />
        </div>
      </div>

      <div className="flex flex-col">
        {isLoading && <p className="text-sm text-gray-400 p-4">Loading users...</p>}
        {error && <p className="text-sm text-red-300 p-4">{error}</p>}

        {!isLoading && !error && filteredUsers.map((user) => {
          const isOnline = onlineUsers.includes(user._id)
          const unreadCount = unseenMessages[user._id] || 0

          return (
            <button
              onClick={() => handleSelectUser(user)}
              key={user._id}
              className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm text-left ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}
            >
              <img src={user?.profilePic || assets.avatar_icon} alt="" className="w-[35px] aspect-square rounded-full" />
              <div className="flex flex-col leading-5 min-w-0">
                <p className="truncate">{user.fullName}</p>
                {isOnline
                  ? <span className="text-green-400 text-xs">Online</span>
                  : <span className="text-neutral-400 text-xs">Offline</span>}
              </div>
              {unreadCount > 0 && <p className="absolute top-4 right-4 text-xs h-5 min-w-5 px-1 flex justify-center items-center rounded-full bg-violet-500/50">{unreadCount}</p>}
            </button>
          )
        })}

        {!isLoading && !error && filteredUsers.length === 0 && <p className="text-sm text-gray-400 p-4">No users found.</p>}
      </div>
    </div>
  )
}

export default Sidebar
