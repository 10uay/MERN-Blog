import { GoogleAuthProvider, signInWithPopup, getAuth } from 'firebase/auth';
import { app } from '../firebase.config.js'
import { useDispatch  } from 'react-redux'
import { signInSuccess } from '../redux/user/userSlice.js'
import { useNavigate } from 'react-router-dom'
import { Button, } from 'flowbite-react'
import { AiFillGoogleCircle } from 'react-icons/ai'


export default function OAuth() {
  const auth = getAuth(app)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    // provider.setCustomParameters({ prompt: 'select_account' })
    console.log('before try');
    try {
      console.log('after try');
      const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              username: result.user.displayName,
              email: result.user.email,
              photoProfile: result.user.photoURL
          })
      })
      console.log(res);
      const data = await res.json()
      dispatch(signInSuccess(data))
      navigate('/')
    }
    catch (error) {
      console.log("couldn't login with google", error);
    }
  }

  return (
    <>
      <Button type='button' gradientDuoTone='pinkToOrange' outline onClick={handleGoogleAuth}>
        <AiFillGoogleCircle className='w-6 h-6 mr-2'/>
        Continue with Google
      </Button>
    </>
  )
}
