/**
 * 格式化工具函数
 */

/**
 * 格式化金额（分转元）
 */
export function formatMoney(amount: number): string {
  return (amount / 100).toFixed(2)
}

/**
 * 解析金额（元转分）
 */
export function parseMoney(value: string | number): number {
  const num = typeof value === 'string' ? parseFloat(value) : value
  return Math.round(num * 100)
}

/**
 * 格式化金额为中文大写
 */
export function formatMoneyChinese(amount: number): string {
  const digits = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖']
  const units = ['', '拾', '佰', '仟', '万', '拾', '佰', '仟', '亿']

  const yuan = Math.floor(amount / 100)
  const fen = amount % 100

  if (yuan === 0 && fen === 0) return '零元'

  let result = ''

  if (yuan > 0) {
    const yuanStr = String(yuan)
    for (let i = 0; i < yuanStr.length; i++) {
      const digit = parseInt(yuanStr[i])
      const unit = units[yuanStr.length - i - 1]
      if (digit !== 0) {
        result += digits[digit] + unit
      } else if (result[result.length - 1] !== '零') {
        result += '零'
      }
    }
    result = result.replace(/零+$/, '') + '元'
  }

  if (fen > 0) {
    const jiao = Math.floor(fen / 10)
    const fenPart = fen % 10

    if (jiao > 0) {
      result += digits[jiao] + '角'
    }
    if (fenPart > 0) {
      result += digits[fenPart] + '分'
    }
  } else if (yuan > 0) {
    result += '整'
  }

  return result
}

/**
 * 格式化文件大小
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + units[i]
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, total: number): string {
  if (total === 0) return '0.0%'
  return ((value / total) * 100).toFixed(1) + '%'
}
