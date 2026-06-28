export type StaffRole = 'support' | 'sales' | 'master'

export type StaffMember = {
  id: string
  name: string
  email: string
  role: StaffRole
  branch: string
  createdAt: string
  status: 'active' | 'inactive'
}

export type SupportTicket = {
  id: string
  customerName: string
  topic: string
  note: string
  status: 'new' | 'assigned' | 'booked' | 'resolved'
  assignedTo: string
  scheduledFor: string
}

export type SalesConsultation = {
  id: string
  customerName: string
  product: string
  executive: string
  date: string
  time: string
  status: 'scheduled' | 'completed'
}
