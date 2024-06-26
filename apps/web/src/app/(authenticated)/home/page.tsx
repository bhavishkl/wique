'use client'

import { StarFilled, StarOutlined } from '@ant-design/icons'
import { Api, Model } from '@web/domain'
import { PageLayout } from '@web/layouts/Page.layout'
import { useAuthentication } from '@web/modules/authentication'
import {
  Button,
  Card,
  Col,
  Input,
  List,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Typography,
} from 'antd'
import debounce from 'lodash/debounce'
import { useRouter } from 'next/navigation'
import { useSnackbar } from 'notistack'
import { useCallback, useEffect, useState } from 'react'
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';

import { useMemo } from 'react'
const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select

export default function HomePage() {
  const router = useRouter()
  const authentication = useAuthentication()
  const userId = authentication.user?.id
  const { enqueueSnackbar } = useSnackbar()

  const [queues, setQueues] = useState<Model.Queue[]>([])
  const [categories, setCategories] = useState<Model.QueueCategory[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  )
  const [loading, setLoading] = useState(false)
  const [favorites, setFavorites] = useState<string[]>([])
  const [participants, setParticipants] = useState<string[]>([])
  const [participantsCount, setParticipantsCount] = useState<{
    [key: string]: number
  }>({})
  const [currentQueue, setCurrentQueue] = useState<Model.Queue | null>(null)
  const [showLeaveQueueModal, setShowLeaveQueueModal] = useState(false)
  const [pendingQueueId, setPendingQueueId] = useState<string | null>(null)

  const predefinedCategories = [
    { id: 'retail', name: 'Retail' },
    { id: 'healthcare', name: 'Healthcare' },
    { id: 'banking', name: 'Banking' },
    { id: 'entertainment', name: 'Entertainment' },
    { id: 'restaurant', name: 'Restaurant' },
  ]

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [queuesData, favoritesData, participantsData] = await Promise.all(
          [
            Api.Queue.findMany({
              includes: ['reviews', 'participants', 'favorites'],
            }),
            Api.Favorite.findManyByUserId(userId),
            Api.Participant.findManyByUserId(userId),
          ],
        )
        setQueues(queuesData)
        setFavorites(favoritesData.map(fav => fav.queueId))
        setParticipants(participantsData.map(part => part.queueId))

        const userParticipant = participantsData.find(
          part => part.userId === userId,
        )
        if (userParticipant) {
          const currentQueueData = queuesData.find(
            queue => queue.id === userParticipant.queueId,
          )
          setCurrentQueue(currentQueueData || null)
        }

        const participantsCountData: { [key: string]: number } = {}
        queuesData.forEach(queue => {
          participantsCountData[queue.id] = queue.participants?.length || 0
        })
        setParticipantsCount(participantsCountData)
      } catch (error) {
        enqueueSnackbar('Failed to load data', { variant: 'error' })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [userId])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
  }

  // Debounced version of handleSearch
  const debouncedHandleSearch = useCallback(debounce(handleSearch, 300), [])

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value)
  }

  const handleJoinQueue = async (queueId: string) => {
    if (currentQueue) {
      setPendingQueueId(queueId)
      setShowLeaveQueueModal(true)
      return
    }

    joinQueue(queueId)
  }

  const joinQueue = async (queueId: string) => {
    setLoading(true)
    try {
      await Api.Participant.createOneByQueueId(queueId, { userId })
      const joinedQueue = queues.find(queue => queue.id === queueId)
      setCurrentQueue(joinedQueue || null)
      setParticipants([...participants, queueId])
      setParticipantsCount(prev => ({
        ...prev,
        [queueId]: (prev[queueId] || 0) + 1,
      }))
      enqueueSnackbar('Joined queue successfully', { variant: 'success' })
      router.push(`/queues/${queueId}`)
    } catch (error) {
      enqueueSnackbar('Failed to join queue', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveQueue = async (id: string) => {
    if (!currentQueue) return

    setLoading(true)
    try {
      const participant = await Api.Participant.findManyByUserId(userId, {
        includes: ['queue'],
      })
      const participantToLeave = participant.find(
        part => part.queueId === currentQueue.id,
      )
      if (participantToLeave) {
        await Api.Participant.deleteOne(participantToLeave.id)
        setParticipants(participants.filter(id => id !== currentQueue.id))
        setParticipantsCount(prev => ({
          ...prev,
          [currentQueue.id]: (prev[currentQueue.id] || 0) - 1,
        }))
        setCurrentQueue(null)
        enqueueSnackbar('Left queue successfully', { variant: 'success' })
        if (pendingQueueId) {
          joinQueue(pendingQueueId)
          setPendingQueueId(null)
        }
      }
    } catch (error) {
      enqueueSnackbar('Failed to leave queue', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteToggle = async (queueId: string) => {
    setLoading(true)
    try {
      if (favorites.includes(queueId)) {
        const favorite = await Api.Favorite.findManyByUserId(userId, {
          includes: ['queue'],
        })
        const favoriteToDelete = favorite.find(fav => fav.queueId === queueId)
        if (favoriteToDelete) {
          await Api.Favorite.deleteOne(favoriteToDelete.id)
          setFavorites(favorites.filter(id => id !== queueId))
          enqueueSnackbar('Removed from favorites', { variant: 'success' })
        }
      } else {
        await Api.Favorite.createOneByQueueId(queueId, { userId })
        setFavorites([...favorites, queueId])
        enqueueSnackbar('Added to favorites', { variant: 'success' })
      }
    } catch (error) {
      enqueueSnackbar('Failed to update favorites', { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const filteredQueues = queues.filter(queue => {
    return (
      queue.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (!selectedCategory || queue.category === selectedCategory)
    )
  })

  const getCategoryName = (categoryId: string) => {
    const category = predefinedCategories.find(cat => cat.id === categoryId)
    return category ? category.name : 'Unknown Category'
  }

  const calculateEstimatedWaitTime = (
    averageTime: string | undefined,
    participantsCount: number,
  ) => {
    if (!averageTime) return 'N/A'
    const [hours, minutes] = averageTime.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    return totalMinutes * participantsCount
  }

  const memoizedCalculateEstimatedWaitTime = useMemo(() => {
    return (averageTime: string | undefined, participantsCount: number) =>
      calculateEstimatedWaitTime(averageTime, participantsCount)
  }, [])

  return (
    <PageLayout layout="narrow">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Search
          placeholder="Search queues"
          onChange={e => debouncedHandleSearch(e.target.value)}
          enterButton
        />
        <Select
          placeholder="Filter by category"
          onChange={handleCategoryChange}
          allowClear
          style={{ width: '100%' }}
        >
          {predefinedCategories.map(category => (
            <Option key={category.id} value={category.id}>
              {category.name}
            </Option>
          ))}
        </Select>
        {loading ? (
          <Spin tip="Loading..." />
        ) : (
          <List
          grid={{
            gutter: 16,
            xs: 1, // One column on extra small screens
            sm: 1, // One column on small screens
            md: 2, // Two columns on medium screens
            lg: 2, // Two columns on large screens
            xl: 2, // Two columns on extra large screens
          }}
            dataSource={filteredQueues}
            renderItem={queue => (
              <List.Item>
                <Card
                  title={queue.name}
                  extra={
                    <Button
                      type="link"
                      icon={
                        favorites.includes(queue.id) ? (
                          <StarFilled />
                        ) : (
                          <StarOutlined />
                        )
                      }
                      onClick={() => handleFavoriteToggle(queue.id)}
                    />
                  }
                  style={{ width: '100%' }}
                >
                 <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Space align="baseline">
              <ClockCircleOutlined />
              <Text>
                ETA:{' '}
                {memoizedCalculateEstimatedWaitTime(
                  queue.averageTime,
                  participantsCount[queue.id],
                )}{' '}
                mins
              </Text>
            </Space>
          </Col>
          <Col xs={24} sm={12}>
            <Space align="baseline">
              <UserOutlined />
              <Text>Participants: {participantsCount[queue.id]}</Text>
            </Space>
          </Col>
        </Row>
                  <Row gutter={16} style={{ marginTop: '10px' }}>
                    <Col span={24}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <StarFilled style={{ color: '#fadb14' }} />
                        <Text>
                          {(
                            queue.reviews?.reduce(
                              (acc, review) => acc + review.rating,
                              0,
                            ) / queue.reviews?.length || 0
                          ).toFixed(1)}
                        </Text>
                      </Space>
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: '10px' }}>
                    <Col span={12}>
                      {participants.includes(queue.id) ? (
                        <Button
                          type="primary"
                          danger
                          onClick={() => handleLeaveQueue(queue.id)}
                        >
                          Leave Queue
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          onClick={() => handleJoinQueue(queue.id)}
                        >
                          Join Queue
                        </Button>
                      )}
                    </Col>
                    <Col span={12}>
                      <Button
                        onClick={() => router.push(`/queues/${queue.id}`)}
                      >
                        Details
                      </Button>
                    </Col>
                  </Row>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Space>
      <Modal
        visible={showLeaveQueueModal}
        onCancel={() => setShowLeaveQueueModal(false)}
        onOk={() => handleLeaveQueue(currentQueue?.id || '')}
        title="Leave Current Queue"
        okText="Leave Queue"
        cancelText="Cancel"
      >
        <p>
          You are already in a queue. Do you want to leave the current queue to
          join another one?
        </p>
      </Modal>
    </PageLayout>
  )
}
