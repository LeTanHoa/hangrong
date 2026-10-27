import { TimeOfDay, WeatherType } from '../types/game';

/**
 * Format VNĐ currency according to Vietnamese standard
 * e.g. 50000 -> 50.000đ
 */
export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0đ';
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('vi-VN').format(rounded);
  return `${formatted}đ`;
}

export function getTimeOfDayLabel(time: TimeOfDay): { label: string; icon: string; desc: string } {
  switch (time) {
    case 'DAWN':
      return { label: 'Sáng sớm (06:00)', icon: '🌅', desc: 'Bình minh, người đi làm & đi học bắt đầu' };
    case 'MORNING':
      return { label: 'Buổi sáng (08:30)', icon: '☀️', desc: 'Cao điểm ăn sáng & cà phê vỉa hè' };
    case 'NOON':
      return { label: 'Buổi trưa (12:00)', icon: '🍲', desc: 'Dân văn phòng & học sinh nghỉ trưa' };
    case 'AFTERNOON':
      return { label: 'Buổi chiều (16:30)', icon: '🌇', desc: 'Giờ tan tầm, thèm quà vặt & đồ uống mát' };
    case 'EVENING':
      return { label: 'Buổi tối (19:30)', icon: '🌙', desc: 'Phố lên đèn, đồ nướng, chè & tụ tập' };
  }
}

export function getWeatherLabel(weather: WeatherType): { label: string; icon: string; effect: string } {
  switch (weather) {
    case 'SUNNY':
      return { label: 'Nắng đẹp', icon: '☀️', effect: 'Lượng khách ổn định, tâm trạng vui vẻ' };
    case 'HOT':
      return { label: 'Nắng gắt oi bức', icon: '🔥', effect: 'Đồ uống mát, nước mía & chè bán chạy +50%' };
    case 'CLOUDY':
      return { label: 'Trời mát mẻ', icon: '⛅', effect: 'Khách dạo phố đông đúc' };
    case 'RAIN':
      return { label: 'Mưa rào phố phường', icon: '🌧️', effect: 'Khách thích đồ nóng hổi (Phở, xiên que, bánh mì)' };
  }
}

export function calculateLevelFromXP(xp: number): { level: number; currentXP: number; xpForNext: number; progress: number } {
  // Balanced XP formula: Progressive level requirements
  let level = 1;
  let accumulatedXP = 0;
  
  while (true) {
    const requiredForThisLevel = Math.round(260 * Math.pow(level, 1.45));
    if (accumulatedXP + requiredForThisLevel > xp) {
      const currentXP = xp - accumulatedXP;
      const progress = Math.min(100, Math.max(0, (currentXP / requiredForThisLevel) * 100));
      return {
        level,
        currentXP,
        xpForNext: requiredForThisLevel,
        progress
      };
    }
    accumulatedXP += requiredForThisLevel;
    level++;
    if (level >= 99) {
      return { level: 99, currentXP: 0, xpForNext: 999999, progress: 100 };
    }
  }
}


