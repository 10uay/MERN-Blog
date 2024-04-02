import { Alert, Button, FileInput, Select, TextInput } from 'flowbite-react'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
} from 'firebase/storage'
import { app } from '../firebase.config.js'
import { useState, useEffect } from 'react'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'


export default function UpdatePost() {
    const { currentUser  } = useSelector(state => state.user)
    const [file, setFile] = useState(null)
    const [imageUploadProgress, setImageUploadProgress] = useState(null)
    const [imageUploadError, setImageUploadError] = useState(null)
    const [formData, setFormData] = useState({})
    const [publishError, setPublishError] = useState(null)
    const navigate = useNavigate()
    const { postId } = useParams()

    const handleChange = (ev) => {
        setFormData({...formData, [ev.target.id] : ev.target.value})
    }

    const handleFileUpload = async () => {
        setImageUploadProgress(null)
        if (!file) {
            setImageUploadError('please select an image')
            return;
        }
        const storage = getStorage(app)
        const imageName = 'post-image-' + new Date().getTime() + '-' + file.name
        const storageRef = ref(storage, imageName)
        const uploadTask = uploadBytesResumable(storageRef, file)
        uploadTask.on(
            'state_changed',
            (snapshot) => {
                let progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                setImageUploadProgress(Math.round(progress))
            },
            (error) => {
                setImageUploadError('Failed to upload image!')
                setImageUploadProgress(null)
            },
            () => {
                getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => setFormData({...formData, image:downloadURL}))
            }
        )
    }

    useEffect(() => {
        try {
        const fetchPost = async () => {
            const res = await fetch(`/api/post/get-posts?postId=${postId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })
            const data = await res.json()
            if (!res.ok) {
                console.log(data.message)
                setPublishError(data.message)
                return;
            }
            if (res.ok) {
                setPublishError(null)
                setFormData(data.posts[0])
            }
        }
        
        fetchPost()
        } catch (error) {
        console.log(error.message)
        }
    }, [postId])

    const handleSubmit = async (ev) => {
        ev.preventDefault()
        setPublishError(null)

        if (!formData.content || !formData.title) {
            setPublishError('Please fill out all required fields!')
        }

        try {
            const res = await fetch(`/api/post/update-post/${postId}/${currentUser._id}`, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            })
            const data = await res.json();
            
            if (!res.ok) {
                console.log(data.message)
                setPublishError(data.message)
            } else {
                console.log(data)
                setPublishError(null)
                navigate(`/post/${data.slug}`)
            }
        } catch (error) {
            setPublishError(error)
        }
    }


    return (
        <div className='p-3 max-w-3xl mx-auto min-h-screen'>
        <h1 className='text-center text-3xl my-7 font-semibold'>Update a post</h1>
            <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                <div className='flex flex-col gap-4 sm:flex-row justify-between'>
                    <TextInput
                        type='text'
                        placeholder='Title'
                        required
                        id='title'
                        className='flex-1'
                        onChange={handleChange}
                        defaultValue={formData.title}
                    />
                    <Select
                        id='category'
                        onChange={handleChange}
                        value={formData.category}
                    >
                        <option value='uncategorized'>Select a category</option>
                        <option value='javascript'>JavaScript</option>
                        <option value='reactjs'>React.js</option>
                        <option value='nextjs'>Next.js</option>
                    </Select>
                </div>
                <div className='flex gap-4 items-center justify-between border-4 border-teal-500 border-dotted p-3'>
                    <FileInput
                        type='file'
                        accept='image/*'
                        onChange={e => setFile(e.target.files[0])}
                    />
                    <Button
                        type='button'
                        gradientDuoTone='purpleToBlue'
                        size='sm'
                        outline
                        disabled={imageUploadProgress}
                        onClick={handleFileUpload}
                    >
                        {imageUploadProgress ? (
                            <div className='w-16 h-16'>
                                <CircularProgressbar
                                value={imageUploadProgress}
                                text={`${imageUploadProgress || 0}%`}
                                />
                            </div>
                            ) : (
                            'Upload Image'
                        )}
                    </Button>
                </div>
                {imageUploadError && <Alert color='failure'>{imageUploadError}</Alert>}
                {formData.image && (
                    <img
                        src={formData.image}
                        alt='upload'
                        className='w-full h-72 object-cover'
                    />
                    )}
                <ReactQuill
                    theme='snow'
                    placeholder='Write something...'
                    className='h-72 mb-12'
                    required
                    onChange={(value) => setFormData({ ...formData, content: value })}
                    value={formData.content}
                />
                <Button
                    type='submit'
                    gradientDuoTone='purpleToPink'
                    disabled={imageUploadProgress && imageUploadProgress !== 100}
                >
                    Publish 
                </Button>
                
                {publishError && (
                    <Alert className='mt-5' color='failure'>
                        {publishError}
                    </Alert>
                )}
            </form>
        </div>
    )
}