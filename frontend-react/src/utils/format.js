
export function formatCount(count) {
  if (count >= 1000) {
    return `${parseFloat((count / 1000).toFixed(1))}k`;
  }
  return `${count}`;
}

export function formatDateTime(dateInput) {
  const date = new Date(dateInput);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  const ss = String(date.getSeconds()).padStart(2, '0');

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}
