import { useDispatch, useSelector } from 'react-redux'
import { useState, useRef, useEffect } from 'react'
import { app } from '../firebase.config.js'
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import {
  updateStart,
  updateSuccess,
  updateFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure
} from '../redux/user/userSlice.js'
import { Alert, Button } from 'flowbite-react'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { Link } from 'react-router-dom'


export default function DashProfile() {
  const { currentUser, error, loading } = useSelector(state => state.user)
  const [formData, setFormData] = useState({})
  const [image, setImage] = useState()
  const [imagePercent, setImagePercent] = useState()
  const [imageError, setImageError] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [emptyFields, setEmptyFields] = useState(false)
  const [uploadedSuccess, setUploadedSuccess] = useState(false)
  const fileRef = useRef(null)
  const dispatch = useDispatch()

  const handlechange = (ev) => {
    setFormData({...formData, [ev.target.id]:ev.target.value})
  }

  const handleFileUpload = async (image) => {
    const storage = getStorage(app)
    const imageName = new Date().getTime() + image.name
    const storageRef = ref(storage, imageName)
    const uploadTask = uploadBytesResumable(storageRef, image)
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        setUploadingImg(true)
        let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setImagePercent(Math.round(progress))
      },
      (error) => {
        if (error) {
          setImageError(true)
          setUploadingImg(false)
        }
      },
      () => {
        setUploadingImg(false)
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => setFormData({...formData, photoProfile:downloadURL}))
      }
    )
    
    console.log(uploadingImg);
  }

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setEmptyFields(false)
    setUploadedSuccess(false)

    if (Object.keys(formData).length === 0) {
      setEmptyFields(true)
      return;
    }
    if (uploadingImg) {
      return;
    }
    
    try {
      dispatch(updateStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      const data = await res.json();
      
      if (!res.ok) {
        console.log(data)
        dispatch(updateFailure(data))
      } else {
        setUploadedSuccess(true)
        dispatch(updateSuccess(data));
      }
    } catch (error) {
      dispatch(updateFailure(error));
    }
  }

  const handleDeleteAccount = async () => {
      dispatch(deleteUserStart())
      await fetch(`/api/user/delete/${currentUser._id}`, {
        method: 'DELETE',
      })
        .then(res => res.json())
        .then(() => dispatch(deleteUserSuccess()))
        .catch(error => dispatch(deleteUserFailure(error)))
  }

  useEffect(() => {
    if (image) handleFileUpload(image)
  }, [image])


  return (
    <>
      <div className="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-center text-2xl font-bold text-indigo-600 sm:text-3xl">Your Profile</h1>

          <p className="mx-auto mt-4 max-w-md text-center text-gray-500">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Obcaecati sunt dolores deleniti
            inventore quaerat mollitia?
          </p>

          <form onSubmit={handleSubmit} action="" className="mb-0 mt-6 space-y-4 rounded-lg p-4 shadow-lg sm:p-6 lg:p-8">
            <input
              type="file"
              hidden
              ref={fileRef}
              accept='image/*'
              onChange={(e) => setImage(e.target.files[0])}
            />
            <div className='relative w-40 h-40 mx-auto'>
              {uploadingImg && (
              <CircularProgressbar
                value={imagePercent}
                text={`${imagePercent}%`}
                  strokeWidth={5}
                  styles={{
                    root: {
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      top: '0',
                      left: '0',
                      zIndex: '44'
                    },
                    path: {
                      stroke: `rgba(62, 152, 199, ${imagePercent / 100})`,
                    }
                  }}
              />
              )}
              <img
                src={formData.photoProfile || currentUser.photoProfile}
                alt="avatar"
                className={` object-cover w-full h-full rounded-full mx-auto mb-6 cursor-pointer
                            ${imagePercent > 0 && imagePercent < 100 ? 'opacity-50' : 'opacity-100'}`}
                onClick={() => fileRef.current.click()}
              />
            </div>

            { imageError ? (
              <span className='text-red-700 block text-center capitalize'>
                  Error uploading image (file size must be less than 2 MB)
              </span>
              )  : imagePercent === 100 ? (
                  <span className='text-green-700 block text-center capitalize'>
                  Image uploaded successfully
                  </span>
              ) : ('')
            }
            
            <div>
              <label htmlFor="username" className="sr-only">username</label>

              <div className="relative">
                <input
                  id='username'
                  type="string"
                  className="w-full rounded-lg text-black border-gray-200 p-3 pe-12 text-md shadow-sm"
                  placeholder="Your Name"
                  defaultValue={currentUser.username}
                  onChange={handlechange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="sr-only">Email</label>

              <div className="relative">
                <input
                  id='email'
                  type="email"
                  className="w-full rounded-lg text-black border-gray-200 p-3 pe-12 text-md shadow-sm"
                  placeholder="Enter email"
                  defaultValue={currentUser.email}
                  onChange={handlechange}
                />

                <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="sr-only">Password</label>

              <div className="relative">
                <input
                  id='password'
                  type="password"
                  className="w-full rounded-lg blue-600 border-gray-200 p-3 pe-12 text-md shadow-sm"
                  placeholder="Enter password"
                  onChange={handlechange}
                />

                <span className="absolute inset-y-0 end-0 grid place-content-center px-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <Button
              color="indigo"
              type="submit"
              className="w-full py-2"
              disabled={loading || uploadingImg}
            >
              {loading ? 'loading...' : 'Update'}
            </Button>

            <div className='flex justify-between gap-3'>
              <Button
                type='button'
                as={Link}
                color="red"
                onClick={handleDeleteAccount}
              >
                Delete my account!
              </Button>
              {currentUser.isAdmin && (
                <Button
                type='button'
                as={Link}
                to="/create-post"
                gradientDuoTone='purpleToPink'
                className='grow'
              >
                Create a post
              </Button>
              )}
            </div>

            
            {uploadingImg && (
              <Alert color='failure' className='mt-5'>
                Please wait to upload the image!
              </Alert>
            )}
            {error && (
              <Alert color='failure' className='mt-5'>
                {error.message}!
              </Alert>
            )}
            {emptyFields && (
              <Alert color='failure' className='mt-5'>
                Please fill a last one field to change it!
              </Alert>
            )}
            {uploadedSuccess && (
              <Alert color='success' className='mt-5'>
                Your data has updated!
              </Alert>
            )}
            
          </form>
        </div>
      </div>
    </>
  )
}

