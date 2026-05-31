import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null)

  return (
    <div className="w-full h-screen sm:px-[8%] lg:px-[12%] sm:py-[5%]">
      <div className={`backdrop-blur-xl border border-gray-600 overflow-hidden h-full grid grid-cols-1 relative sm:rounded-2xl ${selectedUser
        ? 'md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]'
        : 'md:grid-cols-2'}`}
      >
        <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        <ChatContainer selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        <RightSidebar selectedUser={selectedUser} />
      </div>
    </div>
  )
}

export default HomePage
