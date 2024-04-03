import {
  Navbar,
  TextInput,
  Button,
  Dropdown,
  Avatar
} from 'flowbite-react'
import { Link, useLocation } from 'react-router-dom'
import { AiOutlineSearch } from 'react-icons/ai'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useSelector, useDispatch } from 'react-redux'
import { signOut } from '../redux/user/userSlice'
import { toggleTheme } from '../redux/theme/themeSlice'


export default function Header() {
  const path = useLocation().pathname
  const { currentUser } = useSelector(state => state.user)
  const { theme } = useSelector(state => state.theme)

  const dispatch = useDispatch()

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/sign-out')
      dispatch(signOut())
    } catch (error) {
      console.log(error)
    }
  }


  return (
    <>
      <Navbar className='border-b-2'>
        <Link
          to='/'
          className='self-center whitespace-nowrap text-sm sm:text-xl font-semibold dark:text-white'
        >
          <span
            className='px-2 py-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg text-white'
          >
            Louay's
          </span>
          Blog
        </Link>

        <form>
          <TextInput
            type='text'
            placeholder='Search...'
            rightIcon={AiOutlineSearch}
            className='hidden lg:inline'
          />
        </form>

        <Button className='w-12 h-10 lg:hidden' color='gray' pill>
          <AiOutlineSearch />
        </Button>

        <div className='flex gap-2 md:order-2'>
          <Button
            className='w-12 h-10 hidden sm:inline'
            color='gray'
            pill
            onClick={() => dispatch(toggleTheme())}
          >
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </Button>
          {currentUser ? (
            <Dropdown
              label={<Avatar alt="User settings" img={currentUser.photoProfile} rounded />}
              arrowIcon={false}
              inline
            >
              <Dropdown.Header>
                <span className="block text-sm">{currentUser.username}</span>
                <span className="block truncate text-sm font-medium">{currentUser.email}</span>
              </Dropdown.Header>
              <Dropdown.Item as={Link} to='/search'>Search</Dropdown.Item>
              {currentUser.isAdmin && (
                <Dropdown.Item as={Link} to='/dashboard?tab=dashboard'>Dashboard</Dropdown.Item>
              )}
              <Dropdown.Divider />
              <Dropdown.Item onClick={handleSignOut}>Sign out</Dropdown.Item>
            </Dropdown>
          ): (
              <Link to='/sign-in'>
                <Button
                  gradientDuoTone='purpleToBlue'
                  outline
                  className='spicf-da-bg'
                >
                  Sign In
                </Button>
              </Link>
          )}
          
          <Navbar.Toggle />
        </div>

        <Navbar.Collapse>
          <Navbar.Link active={path === '/'} as={Link} to='/' className='text-center'>
            Home
          </Navbar.Link>
          <Navbar.Link active={path === '/about'} as={Link} to='/about' className='text-center'>
            About
          </Navbar.Link>
          <Navbar.Link active={path === '/projects'} as={Link} to='/projects' className='text-center border-none'>
            Projects
          </Navbar.Link>
        </Navbar.Collapse>
      </Navbar>
    </>
  )
}
