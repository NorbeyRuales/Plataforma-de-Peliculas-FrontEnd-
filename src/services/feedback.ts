import { supa } from './supa'

export type FeedbackCategory = 'idea' | 'lista' | 'bug'

export const Feedback = {
  async send(opts: { category: FeedbackCategory; message: string; file?: File }) {
    const { category, file } = opts
    const message = (opts.message ?? '').trim()

    let userId: string | null = null
    let screenshot_url: string | null = null

    try {
      // Tomar userId si existe sesión (no es obligatorio)
      const { data: u } = await supa.auth.getUser()
      userId = u?.user?.id ?? null

      // Subir screenshot SIEMPRE (con prefijo distinto si es anónimo)
      if (file) {
        const ext = (file.name.split('.').pop() || 'png').toLowerCase()
        const prefix = userId ? `u_${userId}` : 'anon'
        const key = `${prefix}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

        const up = await supa.storage.from('feedback').upload(key, file, {
          upsert: false,
          cacheControl: '3600',
          contentType: file.type || 'image/png',
        })
        if (up.error) throw up.error

        const pub = supa.storage.from('feedback').getPublicUrl(key)
        screenshot_url = pub.data.publicUrl || null
      }

      // Insert en la tabla (tu policy ya permite insertar)
      const { error } = await supa.from('feedback').insert({
        user_id: userId,              // puede ser null
        category,
        message,
        url: window.location.pathname,
        user_agent: navigator.userAgent,
        screenshot_url,
      })
      if (error) throw error

      return true
    } catch (e: any) {
      console.error('[Feedback.send] error:', e?.message || e)
      return false
    }
  },
}
