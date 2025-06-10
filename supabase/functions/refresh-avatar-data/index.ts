
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

    const { avatarId } = await req.json()

    if (!avatarId) {
      return new Response(
        JSON.stringify({ error: 'Avatar ID required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get current avatar data
    const { data: avatar, error: avatarError } = await supabase
      .from('user_avatars')
      .select('*')
      .eq('id', avatarId)
      .single()

    if (avatarError || !avatar.heygen_avatar_id) {
      console.error('Avatar not found or missing HeyGen ID:', avatarError)
      return new Response(
        JSON.stringify({ error: 'Avatar not found or missing HeyGen ID' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Call HeyGen API to get updated avatar data
    const heygenResponse = await fetch(`https://api.heygen.com/v2/avatars/${avatar.heygen_avatar_id}`, {
      method: 'GET',
      headers: {
        'X-API-Key': Deno.env.get('HEYGEN_API_KEY') ?? '',
        'Content-Type': 'application/json',
      },
    })

    const heygenData = await heygenResponse.json()

    if (!heygenResponse.ok) {
      console.error('HeyGen API error:', heygenData)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch avatar data from HeyGen' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('HeyGen avatar data:', heygenData)

    // Check if we have new data to update
    const hasNewThumbnail = heygenData.data?.thumbnail_url && heygenData.data.thumbnail_url !== avatar.thumbnail_url
    const hasNewPreview = heygenData.data?.preview_video_url && heygenData.data.preview_video_url !== avatar.preview_video_url

    if (hasNewThumbnail || hasNewPreview) {
      // Update avatar with new data
      const updateData: any = { updated_at: new Date().toISOString() }
      
      if (hasNewThumbnail) {
        updateData.thumbnail_url = heygenData.data.thumbnail_url
      }
      
      if (hasNewPreview) {
        updateData.preview_video_url = heygenData.data.preview_video_url
      }

      const { error: updateError } = await supabase
        .from('user_avatars')
        .update(updateData)
        .eq('id', avatarId)

      if (updateError) {
        console.error('Error updating avatar:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update avatar data' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          updated: true,
          thumbnail_url: updateData.thumbnail_url,
          preview_video_url: updateData.preview_video_url
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    } else {
      return new Response(
        JSON.stringify({ 
          success: true, 
          updated: false,
          message: 'No new data available'
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Error refreshing avatar data:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
