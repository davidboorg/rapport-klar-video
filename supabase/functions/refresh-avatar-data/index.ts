
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log('refresh-avatar-data function called:', req.method)
  
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request')
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Creating Supabase client...')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Parsing request body...')
    const { avatarId } = await req.json()
    console.log('Avatar ID received:', avatarId)

    if (!avatarId) {
      console.error('No avatar ID provided')
      return new Response(
        JSON.stringify({ error: 'Avatar ID required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Fetching avatar from database...')
    // Get current avatar data
    const { data: avatar, error: avatarError } = await supabase
      .from('user_avatars')
      .select('*')
      .eq('id', avatarId)
      .single()

    if (avatarError) {
      console.error('Database error fetching avatar:', avatarError)
      return new Response(
        JSON.stringify({ error: 'Avatar not found in database' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Avatar found:', { 
      id: avatar.id, 
      name: avatar.name, 
      heygen_avatar_id: avatar.heygen_avatar_id,
      status: avatar.status 
    })

    if (!avatar.heygen_avatar_id) {
      console.error('Avatar missing HeyGen ID')
      return new Response(
        JSON.stringify({ error: 'Avatar missing HeyGen ID' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get the API key from environment variables (Supabase secrets)
    const heygenApiKey = Deno.env.get('HEYGEN_API_KEY')
    
    if (!heygenApiKey) {
      console.error('HEYGEN_API_KEY not found in environment variables')
      return new Response(
        JSON.stringify({ error: 'HEYGEN_API_KEY not configured in Supabase environment variables' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Calling HeyGen API for avatar:', avatar.heygen_avatar_id)
    // Call HeyGen API to get updated avatar data
    const heygenResponse = await fetch(`https://api.heygen.com/v2/avatars/${avatar.heygen_avatar_id}`, {
      method: 'GET',
      headers: {
        'X-API-Key': heygenApiKey,
        'Content-Type': 'application/json',
      },
    })

    console.log('HeyGen API response status:', heygenResponse.status)
    const heygenData = await heygenResponse.json()

    if (!heygenResponse.ok) {
      console.error('HeyGen API error response:', heygenData)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch avatar data from HeyGen', details: heygenData }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('HeyGen avatar data received:', {
      has_thumbnail: !!heygenData.data?.thumbnail_url,
      has_preview: !!heygenData.data?.preview_video_url,
      thumbnail_url: heygenData.data?.thumbnail_url || 'null',
      preview_video_url: heygenData.data?.preview_video_url || 'null'
    })

    // Check if we have new data to update
    const hasNewThumbnail = heygenData.data?.thumbnail_url && heygenData.data.thumbnail_url !== avatar.thumbnail_url
    const hasNewPreview = heygenData.data?.preview_video_url && heygenData.data.preview_video_url !== avatar.preview_video_url

    console.log('Update check:', { hasNewThumbnail, hasNewPreview })

    if (hasNewThumbnail || hasNewPreview) {
      console.log('Updating avatar with new data...')
      // Update avatar with new data
      const updateData: any = { updated_at: new Date().toISOString() }
      
      if (hasNewThumbnail) {
        updateData.thumbnail_url = heygenData.data.thumbnail_url
        console.log('Adding new thumbnail URL')
      }
      
      if (hasNewPreview) {
        updateData.preview_video_url = heygenData.data.preview_video_url
        console.log('Adding new preview video URL')
      }

      const { error: updateError } = await supabase
        .from('user_avatars')
        .update(updateData)
        .eq('id', avatarId)

      if (updateError) {
        console.error('Error updating avatar in database:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update avatar data' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        )
      }

      console.log('Avatar updated successfully')
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
      console.log('No new data found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          updated: false,
          message: 'No new data available',
          current_thumbnail: avatar.thumbnail_url,
          current_preview: avatar.preview_video_url
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

  } catch (error) {
    console.error('Unexpected error in refresh-avatar-data:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
