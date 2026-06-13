const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export async function downloadExport(
  module: string,
  format: 'xlsx' | 'pdf',
  filename: string,
): Promise<void> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('smoe_access_token') : null;

  const res = await fetch(`${API}/${module}/export?format=${format}`, {
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });

  if (!res.ok) throw new Error(`Export échoué (${res.status})`);

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
