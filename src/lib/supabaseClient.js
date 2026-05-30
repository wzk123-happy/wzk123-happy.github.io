import { createClient } from '@supabase/supabase-js'

// 优先使用环境变量，不存在时使用硬编码兜底（publishable key 是公开的，可以安全写在代码里）
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://aqkhwevwveojbzmpevio.supabase.co'
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_fnW1mch4a9ndAgnTFksGpQ_B_bCBl9_'

export const supabase = createClient(supabaseUrl, supabasePublishableKey)
