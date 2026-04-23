export type JobStatus = 'Active' | 'Wrapping Up' | 'Complete'
export type MaterialStatus = 'needed' | 'ordered' | 'on_site'
export type ChangeOrderStatus = 'pending' | 'approved' | 'declined'
export type InvoiceStatus = 'draft' | 'sent' | 'paid'
export type Availability = 'available' | 'busy' | 'unavailable'

export interface Job {
  id: string
  name: string
  address: string | null
  trade: string | null
  status: JobStatus
  client_name: string | null
  client_email: string | null
  value: number
  created_at: string
  // joined
  crew?: CrewMember[]
  tasks?: Task[]
}

export interface Task {
  id: string
  job_id: string
  text: string
  done: boolean
  order_index: number
  created_at: string
}

export interface CrewMember {
  id: string
  name: string
  role: string | null
  phone: string | null
  email: string | null
  created_at: string
}

export interface Transaction {
  id: string
  job_id: string | null
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string | null
  date: string
  receipt_url: string | null
  created_at: string
  // joined
  job?: Pick<Job, 'id' | 'name'>
}

export interface Flag {
  id: string
  job_id: string
  job_name: string | null
  flagged_by: string | null
  text: string
  resolved: boolean
  created_at: string
}

export interface ClientUpdate {
  id: string
  job_id: string
  message: string | null
  photo_url: string | null
  photo_name: string | null
  sent_by: string | null
  created_at: string
}

export interface Material {
  id: string
  job_id: string
  name: string
  qty: string | null
  status: MaterialStatus
  created_at: string
}

export interface ChangeOrder {
  id: string
  job_id: string
  description: string
  amount: number
  status: ChangeOrderStatus
  created_at: string
}

export interface Rating {
  id: string
  job_id: string
  score: number
  comment: string | null
  created_at: string
}

export interface Schedule {
  id: string
  job_id: string
  crew_id: string
  date: string
  created_at: string
  // joined
  job?: Pick<Job, 'id' | 'name' | 'trade'>
  crew_member?: Pick<CrewMember, 'id' | 'name' | 'role'>
}

export interface SubProfile {
  id: string
  name: string
  trade: string | null
  phone: string | null
  email: string | null
  bio: string | null
  availability: Availability
  created_at: string
}

export interface Admin {
  id: string
  name: string
  pin: string
  role: 'admin' | 'manager'
  created_at: string
}

export interface Photo {
  id: string
  job_id: string
  task_id: string | null
  url: string
  caption: string | null
  taken_by: string | null
  created_at: string
}

export interface Selection {
  id: string
  job_id: string
  url: string
  label: string | null
  category: string
  created_at: string
}

export interface Invoice {
  id: string
  job_id: string
  amount: number
  line_items: { description: string; amount: number }[]
  status: InvoiceStatus
  sent_at: string | null
  paid_at: string | null
  created_at: string
  // joined
  job?: Pick<Job, 'id' | 'name' | 'client_name' | 'client_email' | 'address'>
}
