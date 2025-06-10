
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { avatarId, videoUrl } = await req.json()

    if (!avatarId || !videoUrl) {
      return new Response(
        JSON.stringify({ error: 'Avatar ID and video URL required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update avatar status to processing
    await supabase
      .from('user_avatars')
      .update({ status: 'processing' })
      .eq('id', avatarId)

    // Call HeyGen API to create avatar
    const heygenResponse = await fetch('https://api.heygen.com/v2/avatars/instant_avatar', {
      method: 'POST',
      headers: {
        'X-API-Key': Deno.env.get('HEYGEN_API_KEY') ?? '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: videoUrl,
        avatar_name: `Avatar_${avatarId}`,
        quality: 'high'
      }),
    })

    const heygenData = await heygenResponse.json()

    if (!heygenResponse.ok) {
      console.error('HeyGen API error:', heygenData)
      
      // Update avatar status to failed
      await supabase
        .from('user_avatars')
        .update({ status: 'failed' })
        .eq('id', avatarId)

      return new Response(
        JSON.stringify({ error: 'Failed to create avatar with HeyGen' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Update avatar with HeyGen avatar ID and status
    await supabase
      .from('user_avatars')
      .update({ 
        heygen_avatar_id: heygenData.data.avatar_id,
        status: 'completed',
        thumbnail_url: heygenData.data.thumbnail_url,
        preview_video_url: heygenData.data.preview_video_url
      })
      .eq('id', avatarId)

    return new Response(
      JSON.stringify({ 
        success: true, 
        avatar_id: heygenData.data.avatar_id,
        thumbnail_url: heygenData.data.thumbnail_url
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error creating avatar:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
