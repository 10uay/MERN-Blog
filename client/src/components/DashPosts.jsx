import { Table, Button, Modal } from 'flowbite-react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useNavigate } from 'react-router-dom'


export default function DashPosts() {
  const { currentUser } = useSelector((state) => state.user)
  const [userPosts, setUserPosts] = useState([])
  const [showMore, setShowMore] = useState(true)
  const [selectedPostId, setSelectedPostId] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const navigate = useNavigate()



  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`/api/post/get-posts?userId=${currentUser._id}`, {
          method: 'GET',
          headers: { 'Content-Type' : 'application/json' }
        })
        const data = await res.json()

        if (res.ok) {
          setUserPosts(data.posts)
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    if (currentUser.isAdmin) fetchPosts()
  }, [currentUser._id])
  
  const handleShowMore  = async () => {
    const startIndex = userPosts.length
    try {
      const res = await fetch(`/api/post/get-posts?userId=${currentUser._id}&startIndex=${startIndex}`, {
          method: 'GET',
          headers: { 'Content-Type' : 'application/json' }
        })
        const data = await res.json()

        if (res.ok) {
          setUserPosts((prev) => [...prev, ...data.posts])
          data.totalPosts === userPosts.length ? setShowMore(false) : setShowMore(true)
        }
    } catch (error) {
      console.log(error.message);
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/post/delete-post/${selectedPostId}/${currentUser._id}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (!res.ok) {
        console.log(data.message)
      } else {
        setUserPosts(prev => prev.filter(singlePost => singlePost._id !== selectedPostId))
      }

    } catch (error) {
      console.log(error.message);
    }
  }

  return (
  <>
    {
      currentUser.isAdmin && (
        <div className='table-auto overflow-x-auto md:mx-auto p-3 scrollbar scrollbar-track-slate-100 scrollbar-thumb-slate-300 dark:scrollbar-track-slate-700 dark:scrollbar-thumb-slate-500'>
          <Table hoverable className='shadow-md'>
            <Table.Head>
              <Table.HeadCell>Date updated</Table.HeadCell>
              <Table.HeadCell>Post image</Table.HeadCell>
              <Table.HeadCell>Post title</Table.HeadCell>
              <Table.HeadCell>Category</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>Edit</Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {
                userPosts.map((post) => (
                  <Table.Row key={post._id}>
                    <Table.Cell>
                      {new Date(post.updatedAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <img
                        src={post.image}
                        alt={post.title}
                        className='w-20 h-10 object-cover bg-gray-500'
                      />
                    </Table.Cell>
                    <Table.Cell
                      onClick={() => navigate(`/post/${post.slug}`)}
                      className='cursor-pointer'
                    >
                      {post.title}
                    </Table.Cell>
                    <Table.Cell>
                      {post.category}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        className='font-medium hover:underline text-red-700'
                        color='red'
                        onClick={() => {
                          setSelectedPostId(post._id)
                          setOpenModal(true)
                        }}
                      >
                        Delete
                      </Button>
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        as={Link}
                        to={`/update-post/${post._id}`}
                        className='font-medium hover:underline'
                      >
                        Edit
                      </Button>
                    </Table.Cell>
                  </Table.Row>
                ))
              }
            </Table.Body>
          </Table>
        </div>
        )}
      {showMore && (
        <button
          onClick={handleShowMore}
          className='w-full text-teal-500 self-center text-sm py-7'
        >
          Show more
        </button>
      )}
      <Modal show={openModal} size="md" onClose={() => setOpenModal(false)} popup >
        <Modal.Header />
        <Modal.Body>
          <div className="text-center">
            <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
            <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">
              Are you sure you want to delete this post?
            </h3>
            <div className="flex justify-center gap-4">
              <Button color="failure" onClick={() => {
                handleDelete()
                setOpenModal(false)
              }}>
                {"Yes, I'm sure"}
              </Button>
              <Button color="gray" onClick={() => setOpenModal(false)}>
                No, cancel
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
  </>
  )
}
