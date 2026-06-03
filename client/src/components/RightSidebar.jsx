import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { useAuth } from '../context/useAuth'

const RightSidebar = ({ selectedUser }) => {
  const navigate = useNavigate()
  const { logout, onlineUsers } = useAuth()
  const isSelectedUserOnline = selectedUser?._id && onlineUsers.includes(selectedUser._id)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return selectedUser && (
    <div className={`bg-[#8185B2]/10 text-white w-full relative overflow-y-scroll ${selectedUser ? "max-md:hidden" : ""}`}>
      <div className="pt-16 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img src={selectedUser?.profilePic || assets.avatar_icon} alt="" className="w-20 aspect-square rounded-full" />
        <h1 className="px-10 text-xl font-medium mx-auto flex items-center gap-2 text-center">
          {isSelectedUserOnline && <span className="w-2 h-2 rounded-full bg-green-500 shrink-0"></span>}
          {selectedUser.fullName}
        </h1>
        <p className="px-10 mx-auto text-center text-gray-300">{selectedUser.bio}</p>
      </div>
      <hr className="border-[#ffffff50] my-4" />
      <div className="px-5 text-xs pb-24">
        <p>Media</p>
        <p className="mt-2 text-gray-400">Shared images will appear here.</p>
      </div>

      <button onClick={handleLogout} className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-sm font-light py-2 px-14 rounded-full cursor-pointer">
        Logout
      </button>
    </div>
  )
}

export default RightSidebar
