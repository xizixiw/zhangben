/**
 * 数据验证工具函数
 */

/**
 * 验证是否为有效金额
 */
export function isValidAmount(value: number): boolean {
  return !isNaN(value) && value >= 0 && value <= 999999999 * 100
}

/**
 * 验证是否为有效日期字符串 (YYYY-MM-DD)
 */
export function isValidDate(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(dateStr)) return false

  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

/**
 * 验证是否为有效时间字符串 (HH:mm)
 */
export function isValidTime(timeStr: string): boolean {
  const regex = /^([01]\d|2[0-3]):([0-5]\d)$/
  return regex.test(timeStr)
}

/**
 * 验证是否为非空字符串
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0
}

/**
 * 验证字符串长度是否在指定范围内
 */
export function isLengthInRange(value: string, min: number, max: number): boolean {
  const len = value.trim().length
  return len >= min && len <= max
}

/**
 * 验证是否为有效的分类类型
 */
export function isValidCategoryType(type: string): boolean {
  return type === 'income' || type === 'expense'
}

/**
 * 验证是否为有效的账户类型
 */
export function isValidAccountType(type: string): boolean {
  const validTypes = ['cash', 'debit_card', 'credit_card', 'e_wallet', 'other']
  return validTypes.includes(type)
}
