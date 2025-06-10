
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { project_id, metric } = await req.json()

    if (!project_id || !metric) {
      return new Response(
        JSON.stringify({ error: 'Missing project_id or metric' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get current analytics or create if doesn't exist
    let { data: analytics, error: fetchError } = await supabaseClient
      .from('project_analytics')
      .select('*')
      .eq('project_id', project_id)
      .single()

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    if (!analytics) {
      // Create new analytics record
      const { data: newAnalytics, error: createError } = await supabaseClient
        .from('project_analytics')
        .insert({
          project_id,
          views: metric === 'views' ? 1 : 0,
          shares: metric === 'shares' ? 1 : 0
        })
        .select()
        .single()

      if (createError) throw createError
      
      return new Response(
        JSON.stringify({ success: true, data: newAnalytics }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      // Update existing analytics
      const updateData: any = {
        last_viewed_at: new Date().toISOString()
      }

      if (metric === 'views') {
        updateData.views = (analytics.views || 0) + 1
      } else if (metric === 'shares') {
        updateData.shares = (analytics.shares || 0) + 1
      }

      const { data: updatedAnalytics, error: updateError } = await supabaseClient
        .from('project_analytics')
        .update(updateData)
        .eq('project_id', project_id)
        .select()
        .single()

      if (updateError) throw updateError

      return new Response(
        JSON.stringify({ success: true, data: updatedAnalytics }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error:', error)
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
