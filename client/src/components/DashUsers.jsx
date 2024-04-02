import { Table, Button, Modal } from 'flowbite-react'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useState } from 'react'
import { HiOutlineExclamationCircle } from "react-icons/hi"
import { FaCheck, FaTimes } from 'react-icons/fa'


export default function DashUsers() {

  const { currentUser } = useSelector((state) => state.user)
  const [users, setUsers] = useState([])
  const [showMore, setShowMore] = useState(true)
  const [selectedUserId, setSelectedUserId] = useState('')
  const [openModal, setOpenModal] = useState(false)


  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/user/get-users', {
          method: 'GET',
          headers: { 'Content-Type' : 'application/json' }
        })
        const data = await res.json()

        if (res.ok) {
          setUsers(data.users)
        }
      } catch (error) {
        console.log(error.message)
      }
    }
    if (currentUser.isAdmin) fetchUsers()
  }, [currentUser._id])
  

  const handleShowMore  = async () => {
    const startIndex = users.length
    try {
      const res = await fetch(`/api/user/get-users?startIndex=${startIndex}`, {
          method: 'GET',
          headers: { 'Content-Type' : 'application/json' }
        })
        const data = await res.json()

        if (res.ok) {
          setUsers((prev) => [...prev, ...data.users])
          data.totalUsers === users.length ? setShowMore(false) : setShowMore(true)
        }
    } catch (error) {
      console.log(error.message);
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/user/delete/${selectedUserId}`, {
        method: 'DELETE'
      })
      const data = await res.json()

      if (!res.ok) {
        console.log(data.message)
      } else {
        setUsers(prev => prev.filter(singleUser => singleUser._id !== selectedUserId))
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
              <Table.HeadCell>Date created</Table.HeadCell>
              <Table.HeadCell>User image</Table.HeadCell>
              <Table.HeadCell>User name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Delete</Table.HeadCell>
              <Table.HeadCell>Admin</Table.HeadCell>
            </Table.Head>

            <Table.Body>
              {
                users.map((user) => (
                  <Table.Row key={user._id}>
                    <Table.Cell>
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </Table.Cell>
                    <Table.Cell>
                      <img
                        src={user.photoProfile}
                        alt={user.title}
                        className='w-20 h-10 object-cover bg-gray-500'
                      />
                    </Table.Cell>
                    <Table.Cell>
                      {user.username}
                    </Table.Cell>
                    <Table.Cell>
                      {user.email}
                    </Table.Cell>
                    <Table.Cell>
                      <Button
                        className='font-medium hover:underline text-red-700'
                        color='red'
                        onClick={() => {
                          setSelectedUserId(user._id)
                          setOpenModal(true)
                        }}
                      >
                        Delete
                      </Button>
                    </Table.Cell>
                    <Table.Cell>
                      {user.isAdmin ? (
                        <FaCheck className='text-green-500 ' />
                      ) : (
                        <FaTimes className='text-red-500' />
                      )}
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
              Are you sure you want to delete this user?
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
