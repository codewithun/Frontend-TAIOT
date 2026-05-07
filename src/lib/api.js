/* eslint-disable no-unused-vars */
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000'

async function request(path, opts = {}) {
  const url = `${BASE}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })

  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch (err) {
    return { success: res.ok, raw: text }
  }
}

export async function getLatestPzem() {
  return request('/pzem/latest')
}

export async function getPzemHistory(limit = 24) {
  return request(`/pzem/history?limit=${limit}`)
}

export async function getRelayState() {
  return request('/relay-state')
}

export async function setRelayState(payload) {
  return request('/relay-control', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function sendAi(payload) {
  return request('/ai', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export default { getLatestPzem, getPzemHistory, getRelayState, setRelayState, sendAi }
