'use server'

import { createClient } from '@/lib/supabase/server'

export async function uploadImage(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('请先登录')
  }

  const file = formData.get('file') as File
  if (!file) {
    throw new Error('请选择图片文件')
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    throw new Error('仅支持 JPG, PNG, WebP 格式')
  }

  // Validate file size (10MB max)
  const maxSize = 10 * 1024 * 1024
  if (file.size > maxSize) {
    throw new Error('文件大小不能超过 10MB')
  }

  // Generate unique filename
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}/${Date.now()}.${fileExt}`

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('images')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`上传失败: ${uploadError.message}`)
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(fileName)

  // Save to images table
  const { data: imageData, error: dbError } = await supabase
    .from('images')
    .insert({
      user_id: user.id,
      original_url: publicUrl,
      file_name: file.name,
      file_size: file.size,
      status: 'pending',
    })
    .select()
    .single()

  if (dbError) {
    throw new Error(`保存记录失败: ${dbError.message}`)
  }

  return {
    id: imageData.id,
    url: publicUrl,
    fileName: file.name,
  }
}

export async function getImageStatus(imageId: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('请先登录')
  }

  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('id', imageId)
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw new Error('获取图片状态失败')
  }

  return data
}

export async function getUserImages() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    throw new Error('请先登录')
  }

  const { data, error } = await supabase
    .from('images')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error('获取图片列表失败')
  }

  return data
}
