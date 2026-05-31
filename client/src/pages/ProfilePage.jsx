import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'
import { useAuth } from '../context/useAuth'

const ProfilePage = () => {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuth()
  const [fullName, setFullName] = useState(user?.fullName || '')
  const [bio, setBio] = useState(user?.bio || '')
  const [profilePic, setProfilePic] = useState(user?.profilePic || '')
  const [status, setStatus] = useState('')

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]

    if (file) {
      setProfilePic(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('')

    await updateProfile({
      fullName: fullName.trim(),
      bio: bio.trim(),
      profilePic,
    })

    setStatus('Profile saved.')
    setTimeout(() => navigate('/'), 400)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10 backdrop-blur-2xl text-white">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl border border-gray-500/70 bg-white/10 rounded-lg shadow-2xl backdrop-blur-xl p-6 sm:p-8 grid gap-8 md:grid-cols-[1.2fr_0.8fr]"
      >
        <div className="flex flex-col gap-5">
          <div>
            <h1 className="text-2xl font-medium">Edit profile</h1>
            <p className="text-sm text-gray-300 mt-1">This profile object is ready to send to your backend later.</p>
          </div>

          <input
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            type="text"
            required
            placeholder="Full name"
            className="p-3 bg-transparent border border-gray-500 rounded-md outline-none focus:ring-2 focus:ring-violet-500"
          />

          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={5}
            placeholder="Short bio"
            className="p-3 bg-transparent border border-gray-500 rounded-md outline-none resize-none focus:ring-2 focus:ring-violet-500"
          />

          {status && <p className="text-sm text-green-300">{status}</p>}

          <div className="flex items-center gap-3">
            <button type="submit" className="py-3 px-7 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-md cursor-pointer">
              Save profile
            </button>
            <button type="button" onClick={() => navigate('/')} className="py-3 px-5 border border-gray-500 rounded-md text-gray-200 cursor-pointer">
              Cancel
            </button>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-5 border border-gray-600/70 rounded-lg p-6 bg-[#282142]/30">
          <img src={profilePic || assets.avatar_icon} alt="" className="w-28 aspect-square rounded-full object-cover" />
          <label htmlFor="avatar" className="cursor-pointer text-sm text-violet-200 hover:text-white">
            Change avatar
          </label>
          <input onChange={handleImageChange} id="avatar" type="file" accept="image/png, image/jpeg" hidden />
          <div className="text-center">
            <p className="font-medium">{fullName || 'Your name'}</p>
            <p className="text-xs text-gray-300 mt-1 break-all">{user?.email}</p>
          </div>
        </div>
      </form>
    </div>
  )
}

export default ProfilePage
