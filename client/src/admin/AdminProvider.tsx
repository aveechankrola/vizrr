import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import {
  adminAddProduct,
  adminDeleteProduct,
  adminLogin,
  adminLogout,
  adminUpdateOrderStatus,
  fetchAdminOrders,
  fetchAdminProducts,
  fetchAdminStats,
  fetchAdminUsers,
  type AdminStats,
  type AdminUser,
  type MyOrder,
  type Product,
} from '../api'
import type { SalesConsultation, StaffMember, StaffRole, SupportTicket } from './types'

function loadStoredList<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

type AdminContextValue = {
  adminToken: string | null
  adminLoginForm: { email: string; password: string }
  setAdminLoginForm: React.Dispatch<React.SetStateAction<{ email: string; password: string }>>
  adminLoginError: string
  adminLoginLoading: boolean
  adminStats: AdminStats | null
  adminOrders: MyOrder[]
  adminProducts: Product[]
  adminUsers: AdminUser[]
  adminLoading: boolean
  staffMembers: StaffMember[]
  supportTickets: SupportTicket[]
  salesConsultations: SalesConsultation[]
  salesConsultForm: { customerName: string; product: string; executive: string; date: string; time: string }
  setSalesConsultForm: React.Dispatch<
    React.SetStateAction<{
      customerName: string
      product: string
      executive: string
      date: string
      time: string
    }>
  >
  staffForm: { name: string; email: string; role: StaffRole; branch: string }
  setStaffForm: React.Dispatch<
    React.SetStateAction<{ name: string; email: string; role: StaffRole; branch: string }>
  >
  staffCreateMessage: string
  setStaffCreateMessage: React.Dispatch<React.SetStateAction<string>>
  supportTalkInput: string
  setSupportTalkInput: React.Dispatch<React.SetStateAction<string>>
  supportTalkLoading: boolean
  supportTalkMessages: Array<{ role: 'executive' | 'support'; content: string }>
  newProductForm: {
    name: string
    category: string
    price: string
    originalPrice: string
    onSale: boolean
    image: string
    imageFile: File | null
    description: string
    rating: string
  }
  setNewProductForm: React.Dispatch<
    React.SetStateAction<{
      name: string
      category: string
      price: string
      originalPrice: string
      onSale: boolean
      image: string
      imageFile: File | null
      description: string
      rating: string
    }>
  >
  newProductOpen: boolean
  setNewProductOpen: React.Dispatch<React.SetStateAction<boolean>>
  newProductLoading: boolean
  newProductError: string
  handleAdminLogin: (e: React.FormEvent) => Promise<void>
  handleAdminLogout: () => Promise<void>
  handleAdminOrderStatus: (orderId: string, status: string) => Promise<void>
  handleAdminDeleteProduct: (id: string) => Promise<void>
  handleAdminAddProduct: (e: React.FormEvent) => Promise<void>
  handleCreateStaffMember: (e: React.FormEvent) => void
  handleAssignExecutive: (ticketId: string, executiveId: string) => void
  handleBookSupportConsult: (ticketId: string) => void
  handleScheduleSalesConsult: (e: React.FormEvent) => void
  handleSupportTalkSend: (e: React.FormEvent) => Promise<void>
}

const AdminContext = createContext<AdminContextValue | null>(null)

export function AdminProvider({ children }: { children?: ReactNode }) {
  const location = useLocation()
  const [adminToken, setAdminToken] = useState<string | null>(() =>
    localStorage.getItem('vizrr_admin_token'),
  )
  const [adminLoginForm, setAdminLoginForm] = useState({ email: '', password: '' })
  const [adminLoginError, setAdminLoginError] = useState('')
  const [adminLoginLoading, setAdminLoginLoading] = useState(false)
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null)
  const [adminOrders, setAdminOrders] = useState<MyOrder[]>([])
  const [adminProducts, setAdminProducts] = useState<Product[]>([])
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([])
  const [adminLoading, setAdminLoading] = useState(false)
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>(() =>
    loadStoredList<StaffMember[]>('vizrr_staff_members', []),
  )
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() =>
    loadStoredList<SupportTicket[]>('vizrr_support_tickets', []),
  )
  const [salesConsultations, setSalesConsultations] = useState<SalesConsultation[]>(() =>
    loadStoredList<SalesConsultation[]>('vizrr_sales_consultations', []),
  )
  const [salesConsultForm, setSalesConsultForm] = useState({
    customerName: '',
    product: '',
    executive: '',
    date: '',
    time: '',
  })
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    role: 'support' as StaffRole,
    branch: 'Shimla HQ',
  })
  const [staffCreateMessage, setStaffCreateMessage] = useState('')
  const [supportTalkInput, setSupportTalkInput] = useState('')
  const [supportTalkLoading, setSupportTalkLoading] = useState(false)
  const [supportTalkMessages, setSupportTalkMessages] = useState<
    Array<{ role: 'executive' | 'support'; content: string }>
  >([
    {
      role: 'executive',
      content:
        'Support Executive online. I can help assign staff, book a consultation, or follow up on customer issues.',
    },
  ])
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'sunglasses',
    price: '',
    originalPrice: '',
    onSale: false,
    image: '',
    imageFile: null as File | null,
    description: '',
    rating: '4.5',
  })
  const [newProductOpen, setNewProductOpen] = useState(false)
  const [newProductLoading, setNewProductLoading] = useState(false)
  const [newProductError, setNewProductError] = useState('')

  useEffect(() => {
    localStorage.setItem('vizrr_staff_members', JSON.stringify(staffMembers))
  }, [staffMembers])
  useEffect(() => {
    localStorage.setItem('vizrr_support_tickets', JSON.stringify(supportTickets))
  }, [supportTickets])
  useEffect(() => {
    localStorage.setItem('vizrr_sales_consultations', JSON.stringify(salesConsultations))
  }, [salesConsultations])

  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (!isAdminRoute || !adminToken) return
    setAdminLoading(true)
    Promise.all([
      fetchAdminStats(adminToken),
      fetchAdminOrders(adminToken),
      fetchAdminProducts(adminToken),
      fetchAdminUsers(adminToken),
    ])
      .then(([stats, orders, products, users]) => {
        setAdminStats(stats)
        setAdminOrders(orders)
        setAdminProducts(products)
        setAdminUsers(users)
        setSupportTickets((prev) => {
          if (prev.length > 0) return prev
          return users.slice(0, 5).map((user, index) => ({
            id: `ticket-${user.id}-${index}`,
            customerName: `${user.firstName} ${user.lastName}`.trim(),
            topic: index % 2 === 0 ? 'Sizing help' : 'Order follow-up',
            note:
              index % 2 === 0
                ? 'Needs guidance for frame fit and specs.'
                : 'Wants an update from the support team.',
            status: 'new' as const,
            assignedTo: '',
            scheduledFor: '',
          }))
        })
        setSalesConsultations((prev) => {
          if (prev.length > 0) return prev
          return orders.slice(0, 4).map((order, index) => ({
            id: `consult-${order.id}-${index}`,
            customerName: `${order.customer.firstName} ${order.customer.lastName}`.trim(),
            product: order.items[0]?.name || 'Frame consultation',
            executive: '',
            date: order.placedAt.slice(0, 10),
            time: index === 0 ? '11:00' : '15:00',
            status: 'scheduled' as const,
          }))
        })
      })
      .catch(() => {})
      .finally(() => setAdminLoading(false))
  }, [isAdminRoute, adminToken, location.pathname])

  const handleAdminLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminLoginLoading(true)
    setAdminLoginError('')
    try {
      const token = await adminLogin(adminLoginForm.email, adminLoginForm.password)
      localStorage.setItem('vizrr_admin_token', token)
      setAdminToken(token)
    } catch (err: unknown) {
      setAdminLoginError(err instanceof Error ? err.message : 'Login failed.')
    } finally {
      setAdminLoginLoading(false)
    }
  }, [adminLoginForm])

  const handleAdminLogout = useCallback(async () => {
    if (adminToken) await adminLogout(adminToken).catch(() => {})
    localStorage.removeItem('vizrr_admin_token')
    setAdminToken(null)
  }, [adminToken])

  const handleAdminOrderStatus = useCallback(
    async (orderId: string, status: string) => {
      if (!adminToken) return
      await adminUpdateOrderStatus(adminToken, orderId, status)
      setAdminOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    },
    [adminToken],
  )

  const handleAdminDeleteProduct = useCallback(
    async (id: string) => {
      if (!adminToken) return
      await adminDeleteProduct(adminToken, id)
      setAdminProducts((prev) => prev.filter((p) => p.id !== id))
    },
    [adminToken],
  )

  const handleAdminAddProduct = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (!adminToken) return
      setNewProductLoading(true)
      setNewProductError('')
      try {
        const created = await adminAddProduct(adminToken, {
          name: newProductForm.name,
          category: newProductForm.category as 'sunglasses' | 'eyeglasses',
          price: Number(newProductForm.price),
          originalPrice: newProductForm.originalPrice
            ? Number(newProductForm.originalPrice)
            : undefined,
          onSale: newProductForm.onSale,
          image:
            newProductForm.imageFile ||
            newProductForm.image ||
            'https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=600',
          description: newProductForm.description,
          rating: Number(newProductForm.rating),
        })
        setAdminProducts((prev) => [...prev, created])
        setNewProductOpen(false)
        setNewProductForm({
          name: '',
          category: 'sunglasses',
          price: '',
          originalPrice: '',
          onSale: false,
          image: '',
          imageFile: null,
          description: '',
          rating: '4.5',
        })
      } catch (err: unknown) {
        setNewProductError(err instanceof Error ? err.message : 'Failed to add product.')
      } finally {
        setNewProductLoading(false)
      }
    },
    [adminToken, newProductForm],
  )

  const makeStaffId = (role: StaffRole) => {
    const prefix = role === 'master' ? 'MST' : role === 'sales' ? 'SAL' : 'SUP'
    return `VZ-${prefix}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
  }

  const handleCreateStaffMember = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const cleanName = staffForm.name.trim()
      const cleanEmail = staffForm.email.trim().toLowerCase()
      if (!cleanName || !cleanEmail) return
      const id = makeStaffId(staffForm.role)
      setStaffMembers((prev) => [
        {
          id,
          name: cleanName,
          email: cleanEmail,
          role: staffForm.role,
          branch: staffForm.branch.trim() || 'Shimla HQ',
          createdAt: new Date().toISOString(),
          status: 'active',
        },
        ...prev,
      ])
      setStaffCreateMessage(`Created ${staffForm.role.toUpperCase()} staff ID ${id}`)
      setStaffForm({ name: '', email: '', role: 'support', branch: 'Shimla HQ' })
    },
    [staffForm],
  )

  const handleAssignExecutive = useCallback((ticketId: string, executiveId: string) => {
    setSupportTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              assignedTo: executiveId,
              status: executiveId ? 'assigned' : ticket.status,
            }
          : ticket,
      ),
    )
  }, [])

  const handleBookSupportConsult = useCallback((ticketId: string) => {
    setSupportTickets((prev) =>
      prev.map((ticket) =>
        ticket.id === ticketId
          ? {
              ...ticket,
              status: 'booked',
              scheduledFor:
                ticket.scheduledFor || new Date(Date.now() + 86400000).toISOString().slice(0, 10),
            }
          : ticket,
      ),
    )
  }, [])

  const handleScheduleSalesConsult = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      const cleanCustomer = salesConsultForm.customerName.trim()
      const cleanProduct = salesConsultForm.product.trim()
      if (!cleanCustomer || !cleanProduct) return
      setSalesConsultations((prev) => [
        {
          id: `sales-${Date.now()}`,
          customerName: cleanCustomer,
          product: cleanProduct,
          executive: salesConsultForm.executive.trim(),
          date: salesConsultForm.date,
          time: salesConsultForm.time,
          status: 'scheduled',
        },
        ...prev,
      ])
      setSalesConsultForm({ customerName: '', product: '', executive: '', date: '', time: '' })
    },
    [salesConsultForm],
  )

  const buildExecutiveTalkReply = (text: string) => {
    const msg = text.toLowerCase()
    if (msg.includes('size') || msg.includes('fit'))
      return 'I’ll help match the customer to the correct frame width and bridge.'
    if (msg.includes('book') || msg.includes('consult'))
      return 'Consultation can be booked from the Sales module or assigned in Support.'
    if (msg.includes('order')) return 'I’ll check order history and update the customer.'
    return 'Support executive noted. I can help with sizing, orders, or consultation booking.'
  }

  const handleSupportTalkSend = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const text = supportTalkInput.trim()
      if (!text || supportTalkLoading) return
      setSupportTalkInput('')
      setSupportTalkMessages((prev) => [...prev, { role: 'support', content: text }])
      setSupportTalkLoading(true)
      try {
        const reply = buildExecutiveTalkReply(text)
        setSupportTalkMessages((prev) => [...prev, { role: 'executive', content: reply }])
      } finally {
        setSupportTalkLoading(false)
      }
    },
    [supportTalkInput, supportTalkLoading],
  )

  const value = useMemo(
    () => ({
      adminToken,
      adminLoginForm,
      setAdminLoginForm,
      adminLoginError,
      adminLoginLoading,
      adminStats,
      adminOrders,
      adminProducts,
      adminUsers,
      adminLoading,
      staffMembers,
      supportTickets,
      salesConsultations,
      salesConsultForm,
      setSalesConsultForm,
      staffForm,
      setStaffForm,
      staffCreateMessage,
      setStaffCreateMessage,
      supportTalkInput,
      setSupportTalkInput,
      supportTalkLoading,
      supportTalkMessages,
      newProductForm,
      setNewProductForm,
      newProductOpen,
      setNewProductOpen,
      newProductLoading,
      newProductError,
      handleAdminLogin,
      handleAdminLogout,
      handleAdminOrderStatus,
      handleAdminDeleteProduct,
      handleAdminAddProduct,
      handleCreateStaffMember,
      handleAssignExecutive,
      handleBookSupportConsult,
      handleScheduleSalesConsult,
      handleSupportTalkSend,
    }),
    [
      adminToken,
      adminLoginForm,
      adminLoginError,
      adminLoginLoading,
      adminStats,
      adminOrders,
      adminProducts,
      adminUsers,
      adminLoading,
      staffMembers,
      supportTickets,
      salesConsultations,
      salesConsultForm,
      staffForm,
      staffCreateMessage,
      supportTalkInput,
      supportTalkLoading,
      supportTalkMessages,
      newProductForm,
      newProductOpen,
      newProductLoading,
      newProductError,
      handleAdminLogin,
      handleAdminLogout,
      handleAdminOrderStatus,
      handleAdminDeleteProduct,
      handleAdminAddProduct,
      handleCreateStaffMember,
      handleAssignExecutive,
      handleBookSupportConsult,
      handleScheduleSalesConsult,
      handleSupportTalkSend,
    ],
  )

  return (
    <AdminContext.Provider value={value}>
      {children ?? <Outlet />}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  const ctx = useContext(AdminContext)
  if (!ctx) throw new Error('useAdmin must be used within AdminProvider')
  return ctx
}
