import { VIDEO_ID } from '@/lib/constant/texts';

// lib/utils/common/getCurrentVideoElement.ts
export function getCurrentVideoElement(): HTMLVideoElement | null {
  // 1. Ưu tiên lấy theo id lưu trong localStorage (nếu có)
  const id = VIDEO_ID;
  if (id) {
    const byId = document.getElementById(id);
    if (byId && byId.tagName === 'VIDEO') return byId as HTMLVideoElement;
  }

  // 2. Nếu không có, tìm video đang hiển thị trong body
  const videos = Array.from(
    document.querySelectorAll('video'),
  ) as HTMLVideoElement[];
  // Ưu tiên video đang hiển thị (không bị display: none)
  const visible = videos.find(
    (v) => v.offsetParent !== null && !v.paused, // hoặc điều kiện khác tùy logic
  );
  if (visible) return visible;

  // 3. Nếu vẫn không có, trả về video đầu tiên tìm được
  return videos[0] || null;
}
