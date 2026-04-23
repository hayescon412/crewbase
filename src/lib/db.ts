import { createClient } from '@/lib/supabase/client'
import type {
  Job, Task, CrewMember, Transaction, Flag, ClientUpdate,
  Material, ChangeOrder, Rating, Schedule, SubProfile,
  Admin, Photo, Invoice, Selection
} from '@/lib/types'

function db() { return createClient() }

// ── JOBS ─────────────────────────────────────────────────────

export async function getJobs(): Promise<Job[]> {
  const { data } = await db().from('jobs').select(`
    *, crew:job_crew(crew(*)), tasks(*)
  `).order('created_at', { ascending: false })
  if (!data) return []
  return data.map((j: any) => ({
    ...j,
    crew: j.crew?.map((jc: any) => jc.crew).filter(Boolean) ?? [],
    tasks: j.tasks ?? [],
  }))
}

export async function getJob(id: string): Promise<Job | null> {
  const { data } = await db().from('jobs').select(`
    *, crew:job_crew(crew(*)), tasks(*)
  `).eq('id', id).single()
  if (!data) return null
  return {
    ...data,
    crew: data.crew?.map((jc: any) => jc.crew).filter(Boolean) ?? [],
    tasks: data.tasks ?? [],
  }
}

export async function createJob(job: Partial<Job>): Promise<Job | null> {
  const { data } = await db().from('jobs').insert({
    name: job.name,
    address: job.address,
    trade: job.trade,
    status: job.status ?? 'Active',
    client_name: job.client_name,
    client_email: job.client_email,
    value: job.value ?? 0,
  }).select().single()
  return data
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<void> {
  await db().from('jobs').update(updates).eq('id', id)
}

export async function deleteJob(id: string): Promise<void> {
  await db().from('jobs').delete().eq('id', id)
}

// ── TASKS ─────────────────────────────────────────────────────

export async function getTasks(jobId: string): Promise<Task[]> {
  const { data } = await db().from('tasks').select('*')
    .eq('job_id', jobId).order('order_index')
  return data ?? []
}

export async function createTask(jobId: string, text: string): Promise<Task | null> {
  const { data: existing } = await db().from('tasks').select('order_index')
    .eq('job_id', jobId).order('order_index', { ascending: false }).limit(1)
  const nextIndex = existing?.[0]?.order_index != null ? existing[0].order_index + 1 : 0
  const { data } = await db().from('tasks').insert({
    job_id: jobId, text, done: false, order_index: nextIndex
  }).select().single()
  return data
}

export async function toggleTask(id: string, done: boolean): Promise<void> {
  await db().from('tasks').update({ done }).eq('id', id)
}

export async function deleteTask(id: string): Promise<void> {
  await db().from('tasks').delete().eq('id', id)
}

// ── CREW ──────────────────────────────────────────────────────

export async function getCrew(): Promise<CrewMember[]> {
  const { data } = await db().from('crew').select('*').order('name')
  return data ?? []
}

export async function createCrewMember(member: Partial<CrewMember>): Promise<CrewMember | null> {
  const { data } = await db().from('crew').insert({
    name: member.name,
    role: member.role,
    phone: member.phone,
    email: member.email,
  }).select().single()
  return data
}

export async function updateCrewMember(id: string, updates: Partial<CrewMember>): Promise<void> {
  await db().from('crew').update(updates).eq('id', id)
}

export async function deleteCrewMember(id: string): Promise<void> {
  await db().from('crew').delete().eq('id', id)
}

export async function assignCrewToJob(jobId: string, crewId: string): Promise<void> {
  await db().from('job_crew').upsert({ job_id: jobId, crew_id: crewId })
}

export async function removeCrewFromJob(jobId: string, crewId: string): Promise<void> {
  await db().from('job_crew').delete().eq('job_id', jobId).eq('crew_id', crewId)
}

// ── TRANSACTIONS ──────────────────────────────────────────────

export async function getTransactions(): Promise<Transaction[]> {
  const { data } = await db().from('transactions').select('*, job:job_id(id, name)')
    .order('date', { ascending: false })
  return data ?? []
}

export async function createTransaction(tx: Partial<Transaction>): Promise<Transaction | null> {
  const { data } = await db().from('transactions').insert({
    job_id: tx.job_id,
    description: tx.description,
    amount: tx.amount,
    type: tx.type,
    category: tx.category,
    date: tx.date,
    receipt_url: tx.receipt_url,
  }).select().single()
  return data
}

export async function deleteTransaction(id: string): Promise<void> {
  await db().from('transactions').delete().eq('id', id)
}

// ── FLAGS ─────────────────────────────────────────────────────

export async function getFlags(): Promise<Flag[]> {
  const { data } = await db().from('flags').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function createFlag(flag: Partial<Flag>): Promise<void> {
  await db().from('flags').insert({
    job_id: flag.job_id,
    job_name: flag.job_name,
    flagged_by: flag.flagged_by,
    text: flag.text,
  })
}

export async function resolveFlag(id: string): Promise<void> {
  await db().from('flags').update({ resolved: true }).eq('id', id)
}

// ── CLIENT UPDATES ────────────────────────────────────────────

export async function getClientUpdates(jobId: string): Promise<ClientUpdate[]> {
  const { data } = await db().from('client_updates').select('*')
    .eq('job_id', jobId).order('created_at', { ascending: false })
  return data ?? []
}

export async function createClientUpdate(update: Partial<ClientUpdate>): Promise<void> {
  await db().from('client_updates').insert({
    job_id: update.job_id,
    message: update.message,
    photo_url: update.photo_url,
    photo_name: update.photo_name,
    sent_by: update.sent_by ?? 'Admin',
  })
}

// ── MATERIALS ─────────────────────────────────────────────────

export async function getMaterials(jobId: string): Promise<Material[]> {
  const { data } = await db().from('materials').select('*').eq('job_id', jobId).order('created_at')
  return data ?? []
}

export async function createMaterial(jobId: string, name: string, qty?: string): Promise<Material | null> {
  const { data } = await db().from('materials').insert({ job_id: jobId, name, qty }).select().single()
  return data
}

export async function updateMaterialStatus(id: string, status: Material['status']): Promise<void> {
  await db().from('materials').update({ status }).eq('id', id)
}

export async function deleteMaterial(id: string): Promise<void> {
  await db().from('materials').delete().eq('id', id)
}

// ── CHANGE ORDERS ─────────────────────────────────────────────

export async function getChangeOrders(jobId: string): Promise<ChangeOrder[]> {
  const { data } = await db().from('change_orders').select('*').eq('job_id', jobId).order('created_at')
  return data ?? []
}

export async function createChangeOrder(co: Partial<ChangeOrder>): Promise<ChangeOrder | null> {
  const { data } = await db().from('change_orders').insert({
    job_id: co.job_id, description: co.description, amount: co.amount ?? 0
  }).select().single()
  return data
}

export async function respondToChangeOrder(id: string, status: 'approved' | 'declined'): Promise<void> {
  await db().from('change_orders').update({ status }).eq('id', id)
}

// ── RATINGS ───────────────────────────────────────────────────

export async function getRatings(): Promise<Rating[]> {
  const { data } = await db().from('ratings').select('*').order('created_at', { ascending: false })
  return data ?? []
}

export async function submitRating(jobId: string, score: number, comment?: string): Promise<void> {
  await db().from('ratings').insert({ job_id: jobId, score, comment })
}

// ── SCHEDULES ─────────────────────────────────────────────────

export async function getSchedules(startDate: string, endDate: string): Promise<Schedule[]> {
  const { data } = await db().from('schedules')
    .select('*, job:job_id(id, name, trade), crew_member:crew_id(id, name, role)')
    .gte('date', startDate).lte('date', endDate).order('date')
  return data ?? []
}

export async function createSchedule(jobId: string, crewId: string, date: string): Promise<void> {
  await db().from('schedules').upsert({ job_id: jobId, crew_id: crewId, date })
}

export async function deleteSchedule(id: string): Promise<void> {
  await db().from('schedules').delete().eq('id', id)
}

// ── SUB PROFILES ──────────────────────────────────────────────

export async function getSubProfiles(): Promise<SubProfile[]> {
  const { data } = await db().from('sub_profiles').select('*').order('name')
  return data ?? []
}

export async function createSubProfile(profile: Partial<SubProfile>): Promise<SubProfile | null> {
  const { data } = await db().from('sub_profiles').insert({
    name: profile.name, trade: profile.trade, phone: profile.phone,
    email: profile.email, bio: profile.bio,
  }).select().single()
  return data
}

export async function updateSubProfile(id: string, updates: Partial<SubProfile>): Promise<void> {
  await db().from('sub_profiles').update(updates).eq('id', id)
}

export async function deleteSubProfile(id: string): Promise<void> {
  await db().from('sub_profiles').delete().eq('id', id)
}

// ── ADMINS ────────────────────────────────────────────────────

export async function getAdmins(): Promise<Admin[]> {
  const { data } = await db().from('admins').select('*').order('created_at')
  return data ?? []
}

export async function verifyAdminPin(name: string, pin: string): Promise<Admin | null> {
  const { data } = await db().from('admins').select('*').eq('name', name).eq('pin', pin).single()
  return data ?? null
}

export async function createAdmin(name: string, pin: string, role: 'admin' | 'manager' = 'admin'): Promise<Admin | null> {
  const { data } = await db().from('admins').insert({ name, pin, role }).select().single()
  return data
}

export async function deleteAdmin(id: string): Promise<void> {
  await db().from('admins').delete().eq('id', id)
}

// ── PHOTOS ────────────────────────────────────────────────────

export async function getPhotos(jobId: string): Promise<Photo[]> {
  const { data } = await db().from('photos').select('*').eq('job_id', jobId).order('created_at', { ascending: false })
  return data ?? []
}

export async function uploadPhoto(
  jobId: string, file: File, caption?: string, takenBy?: string, taskId?: string
): Promise<Photo | null> {
  const ext = file.name.split('.').pop()
  const path = `${jobId}/${Date.now()}.${ext}`
  const { error: uploadError } = await db().storage.from('photos').upload(path, file)
  if (uploadError) return null
  const { data: { publicUrl } } = db().storage.from('photos').getPublicUrl(path)
  const { data } = await db().from('photos').insert({
    job_id: jobId, task_id: taskId ?? null,
    url: publicUrl, caption, taken_by: takenBy,
  }).select().single()
  return data
}

export async function deletePhoto(id: string, url: string): Promise<void> {
  const path = url.split('/photos/')[1]
  if (path) await db().storage.from('photos').remove([path])
  await db().from('photos').delete().eq('id', id)
}

// ── INVOICES ──────────────────────────────────────────────────

export async function getInvoices(): Promise<Invoice[]> {
  const { data } = await db().from('invoices')
    .select('*, job:job_id(id, name, client_name, client_email, address)')
    .order('created_at', { ascending: false })
  return data ?? []
}

export async function generateInvoice(jobId: string): Promise<Invoice | null> {
  const [job, transactions] = await Promise.all([
    getJob(jobId),
    db().from('transactions').select('*').eq('job_id', jobId).eq('type', 'income').then(r => r.data ?? [])
  ])
  if (!job) return null
  const lineItems = transactions.map((t: any) => ({ description: t.description, amount: t.amount }))
  const total = lineItems.reduce((sum: number, i: any) => sum + i.amount, 0) || job.value
  const { data } = await db().from('invoices').insert({
    job_id: jobId,
    amount: total,
    line_items: lineItems,
    status: 'draft',
  }).select().single()
  return data
}

export async function updateInvoiceStatus(id: string, status: Invoice['status']): Promise<void> {
  const updates: any = { status }
  if (status === 'sent') updates.sent_at = new Date().toISOString()
  if (status === 'paid') updates.paid_at = new Date().toISOString()
  await db().from('invoices').update(updates).eq('id', id)
}

// ── SELECTIONS ────────────────────────────────────────────────

export async function getSelections(jobId: string): Promise<Selection[]> {
  const { data } = await db().from('selections').select('*')
    .eq('job_id', jobId).order('category').order('created_at')
  return (data ?? []) as Selection[]
}

export async function uploadSelection(jobId: string, file: File, category: string, label?: string): Promise<void> {
  const ext = file.name.split('.').pop()
  const path = `selections/${jobId}/${Date.now()}.${ext}`
  const { data: storageData } = await db().storage.from('photos').upload(path, file, { upsert: true })
  if (!storageData) return
  const { data: { publicUrl } } = db().storage.from('photos').getPublicUrl(path)
  await db().from('selections').insert({ job_id: jobId, url: publicUrl, category, label: label || null })
}

export async function deleteSelection(id: string, url: string): Promise<void> {
  const path = url.split('/photos/')[1]
  if (path) await db().storage.from('photos').remove([decodeURIComponent(path)])
  await db().from('selections').delete().eq('id', id)
}
