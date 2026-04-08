export function getNextMonthBusinessDay(businessDayX: number): string {
  if (!businessDayX || businessDayX < 1) return ''
  const today = new Date()
  let year = today.getFullYear()
  let month = today.getMonth() + 1 // Next month

  if (month > 11) {
    month = 0
    year += 1
  }

  const currentDay = new Date(year, month, 1)
  let businessDaysCount = 0

  while (businessDaysCount < businessDayX) {
    const dayOfWeek = currentDay.getDay()
    // 0 = Sunday, 6 = Saturday
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDaysCount++
    }
    if (businessDaysCount < businessDayX) {
      currentDay.setDate(currentDay.getDate() + 1)
    }
  }

  // Format as YYYY-MM-DD
  const yyyy = currentDay.getFullYear()
  const mm = String(currentDay.getMonth() + 1).padStart(2, '0')
  const dd = String(currentDay.getDate()).padStart(2, '0')

  return `${yyyy}-${mm}-${dd}`
}
