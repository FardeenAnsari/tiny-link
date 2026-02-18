import { format } from 'date-fns'

export function toUTCDate(d: Date | string) {
  const date = typeof d === 'string' ? new Date(d) : d
  return new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  ))
}

export function formatUTC(d: Date | string, fmt: string) {
  return format(toUTCDate(d), fmt)
}
