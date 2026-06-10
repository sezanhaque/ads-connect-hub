// Edge Function: update-status
// Allows the internal TTS system to create/update/delete rows in the
// SOAP Status Page tables (status_incidents, status_connections, status_maintenance).
// Auth: shared secret via the `x-tts-secret` header, checked against the
// TTS_STATUS_SECRET project secret. Uses the service role key to bypass RLS.

import { createClient } from 'jsr:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-tts-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const JSON_HEADERS = { ...CORS_HEADERS, 'Content-Type': 'application/json' }

const TABLES: Record<string, { name: string; allowedFields: string[] }> = {
  incidents: {
    name: 'status_incidents',
    allowedFields: ['title', 'affected_service', 'status', 'description', 'started_at', 'resolved_at'],
  },
  connections: {
    name: 'status_connections',
    allowedFields: ['service_key', 'service_name', 'category', 'status', 'last_sync_at', 'response_time_ms'],
  },
  maintenance: {
    name: 'status_maintenance',
    allowedFields: ['title', 'affected_services', 'scheduled_at', 'duration_minutes', 'timezone'],
  },
}

function pickAllowed(data: Record<string, unknown>, allowedFields: string[]) {
  const result: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in data) result[key] = data[key]
  }
  return result
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS })
  }

  const expectedSecret = Deno.env.get('TTS_STATUS_SECRET')
  const providedSecret = req.headers.get('x-tts-secret')
  if (!expectedSecret || providedSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS,
    })
  }

  let body: { table?: string; action?: string; id?: string; data?: Record<string, unknown> }
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: JSON_HEADERS,
    })
  }

  const { table, action, id, data } = body

  if (!table || !(table in TABLES)) {
    return new Response(
      JSON.stringify({ error: `table must be one of: ${Object.keys(TABLES).join(', ')}` }),
      { status: 400, headers: JSON_HEADERS },
    )
  }

  if (!action || !['create', 'update', 'delete'].includes(action)) {
    return new Response(
      JSON.stringify({ error: 'action must be one of: create, update, delete' }),
      { status: 400, headers: JSON_HEADERS },
    )
  }

  const { name: tableName, allowedFields } = TABLES[table]

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  if (action === 'create') {
    if (!data) {
      return new Response(JSON.stringify({ error: 'data is required for create' }), {
        status: 400,
        headers: JSON_HEADERS,
      })
    }
    const { data: row, error } = await supabase
      .from(tableName)
      .insert(pickAllowed(data, allowedFields))
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: JSON_HEADERS,
      })
    }
    return new Response(JSON.stringify({ data: row }), { headers: JSON_HEADERS })
  }

  if (action === 'update') {
    if (!id || !data) {
      return new Response(JSON.stringify({ error: 'id and data are required for update' }), {
        status: 400,
        headers: JSON_HEADERS,
      })
    }
    const { data: row, error } = await supabase
      .from(tableName)
      .update(pickAllowed(data, allowedFields))
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: JSON_HEADERS,
      })
    }
    return new Response(JSON.stringify({ data: row }), { headers: JSON_HEADERS })
  }

  // action === 'delete'
  if (!id) {
    return new Response(JSON.stringify({ error: 'id is required for delete' }), {
      status: 400,
      headers: JSON_HEADERS,
    })
  }
  const { error } = await supabase.from(tableName).delete().eq('id', id)
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: JSON_HEADERS,
    })
  }
  return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADERS })
})
