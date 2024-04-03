import { useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import DashSidebar from "../components/DashSidebar"
import DashProfile from "../components/DashProfile"
import DashPosts from "../components/DashPosts"
import DashUsers from "../components/DashUsers"
import DashComments from "../components/DashComments"
import DashCromp from "../components/DashComp"


export default function Dashboard() {
  const location = useLocation()
  const [tab, setTab] = useState('')


  useEffect(() => {
    const urlParams = new URLSearchParams(location.search)
    const tabFromUrl = urlParams.get('tab')
    if (tabFromUrl) {
      setTab(tabFromUrl)
    }
  }, [location.search])

  return (
    <div className="flex my-2 min-h-screen flex-col md:flex-row overflow-hidden">
      <div>
        <DashSidebar />
      </div>
      <div className="grow overflow-x-auto">
        {tab === 'profile' && <DashProfile />}
        {tab === 'posts' && <DashPosts />}
        {tab === 'users' && <DashUsers />}
        {tab === 'comments' && <DashComments />}
        {tab === 'dashComp' && <DashCromp />}
      </div>
    </div>
  )
}
