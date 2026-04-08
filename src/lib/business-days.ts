export function getBusinessDayOfMonth(year: number, month: number, businessDayX: number): string {
  if (!businessDayX || businessDayX < 1) return ''
  // JS month is 0-indexed (0 = Jan, 11 = Dec)
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

export function getNextMonthBusinessDay(businessDayX: number): string {
  if (!businessDayX || businessDayX < 1) return ''
  const today = new Date()
  let year = today.getFullYear()
  let month = today.getMonth() + 1 // Next month

  if (month > 11) {
    month = 0
    year += 1
  }

  return getBusinessDayOfMonth(year, month, businessDayX)
}

export function calculateInstallmentDeadline(
  businessDayX: number,
  dataAdesao: string,
  parcelaAtual: number,
): string {
  if (!businessDayX || businessDayX < 1) return ''

  // For the first installment (0 or 1), the deadline is within the adhesion month
  if (parcelaAtual <= 1 && dataAdesao) {
    const [yearStr, monthStr] = dataAdesao.split('-')
    if (yearStr && monthStr) {
      const year = parseInt(yearStr, 10)
      const month = parseInt(monthStr, 10) - 1 // JS Date month is 0-indexed
      return getBusinessDayOfMonth(year, month, businessDayX)
    }
  }

  // For subsequent installments, use the next month rule
  return getNextMonthBusinessDay(businessDayX)
}
