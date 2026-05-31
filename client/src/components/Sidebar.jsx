import { useMemo, useState } from 'react'
import assets, { userDummyData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [search, setSearch] = useState('')

  const users = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return userDummyData
    }

    return userDummyData.filter((user) =>
      user.fullName.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
    )
  }, [search])

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
        {users.map((user, index) => (
          <button
            onClick={() => setSelectedUser(user)}
            key={user._id}
            className={`relative flex items-center gap-2 p-2 pl-4 rounded cursor-pointer max-sm:text-sm text-left ${selectedUser?._id === user._id && 'bg-[#282142]/50'}`}
          >
            <img src={user?.profilePic || assets.avatar_icon} alt="" className="w-[35px] aspect-square rounded-full" />
            <div className="flex flex-col leading-5 min-w-0">
              <p>{user.fullName}</p>
              {index < 3
                ? <span className="text-green-400 text-xs">Online</span>
                : <span className="text-neutral-400 text-xs">Offline</span>}
            </div>
            {index > 2 && <p className="absolute top-4 right-4 text-xs h-5 w-5 flex justify-center items-center rounded-full bg-violet-500/50">{index}</p>}
          </button>
        ))}
        {users.length === 0 && <p className="text-sm text-gray-400 p-4">No users found.</p>}
      </div>
    </div>
  )
}

export default Sidebar
