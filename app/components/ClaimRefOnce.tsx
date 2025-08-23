'use client'
import { useEffect, useRef } from 'react'

export default function ClaimRefOnce() {
  const done = useRef(false)
  useEffect(() => {
    if (done.current) return
    done.current = true
    fetch('/api/claim-ref', { method: 'POST' }).catch(() => {})
  }, [])
  return null
}
