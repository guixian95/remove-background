'use server'

import { createClient } from '@/lib/supabase/server'

export async function processImage(imageId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('请先登录')
  }

  // Get image record
  const { data: image, error: fetchError } = await supabase
    .from('images')
    .select('*')
    .eq('id', imageId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !image) {
    throw new Error('图片不存在')
  }

  if (image.status !== 'pending') {
    throw new Error('图片状态异常')
  }

  // Update status to processing
  await supabase
    .from('images')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', imageId)

  try {
    // Fetch original image
    const imageResponse = await fetch(image.original_url)
    if (!imageResponse.ok) {
      throw new Error('获取原始图片失败')
    }
    
    const imageBuffer = await imageResponse.arrayBuffer()
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' })
    
    // Call remove.bg API
    const formData = new FormData()
    formData.append('image_file', imageBlob, 'image.png')
    formData.append('size', 'auto')
    
    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.REMOVE_BG_API_KEY!,
      },
      body: formData,
    })
    
    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text()
      throw new Error(`抠图处理失败: ${errorText}`)
    }
    
    const resultBlob = await removeBgResponse.blob()
    
    // Upload processed image
    const processedFileName = `${user.id}/processed_${Date.now()}.png`
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(processedFileName, resultBlob, {
        contentType: 'image/png',
        cacheControl: '3600',
      })
    
    if (uploadError) {
      throw new Error(`上传处理结果失败: ${uploadError.message}`)
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(processedFileName)
    
    // Update image record
    await supabase
      .from('images')
      .update({ 
        processed_url: publicUrl, 
        status: 'completed',
        updated_at: new Date().toISOString() 
      })
      .eq('id', imageId)
    
    // Update usage count
    const currentMonth = new Date().toISOString().slice(0, 7)
    const { data: usage } = await supabase
      .from('usage')
      .select('images_processed')
      .eq('user_id', user.id)
      .eq('month_year', currentMonth)
      .single()
    
    if (usage) {
      await supabase
        .from('usage')
        .update({ 
          images_processed: usage.images_processed + 1,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
    } else {
      await supabase
        .from('usage')
        .insert({
          user_id: user.id,
          month_year: currentMonth,
          images_processed: 1,
        })
    }
    
    return { success: true, processedUrl: publicUrl }
  } catch (error) {
    // Update status to failed
    await supabase
      .from('images')
      .update({ 
        status: 'failed',
        updated_at: new Date().toISOString() 
      })
      .eq('id', imageId)

    throw error
  }
}

export async function deleteImage(imageId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('请先登录')
  }

  // Get image record
  const { data: image, error: fetchError } = await supabase
    .from('images')
    .select('*')
    .eq('id', imageId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !image) {
    throw new Error('图片不存在')
  }

  // Delete from storage if exists
  if (image.original_url) {
    const originalPath = image.original_url.split('/').slice(-2).join('/')
    await supabase.storage.from('images').remove([originalPath])
  }

  if (image.processed_url) {
    const processedPath = image.processed_url.split('/').slice(-2).join('/')
    await supabase.storage.from('images').remove([processedPath])
  }

  // Delete record
  const { error: deleteError } = await supabase
    .from('images')
    .delete()
    .eq('id', imageId)
    .eq('user_id', user.id)

  if (deleteError) {
    throw new Error('删除失败')
  }

  return { success: true }
}
