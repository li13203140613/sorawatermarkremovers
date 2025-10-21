'use client'

import { useState, useCallback } from 'react'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: string | null
}

export interface UseAsyncReturn<T, Args extends unknown[]> {
  data: T | null
  loading: boolean
  error: string | null
  execute: (...args: Args) => Promise<T | null>
  reset: () => void
  setData: (data: T | null) => void
}

/**
 * 通用异步操作 Hook
 * 统一管理 loading、error、data 状态
 *
 * @example
 * const { data, loading, error, execute } = useAsync(async (id: string) => {
 *   const response = await fetch(`/api/user/${id}`)
 *   return response.json()
 * })
 *
 * // 调用
 * await execute('123')
 */
export function useAsync<T = unknown, Args extends unknown[] = []>(
  asyncFunction: (...args: Args) => Promise<T>
): UseAsyncReturn<T, Args> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState({ data: null, loading: true, error: null })

      try {
        const result = await asyncFunction(...args)
        setState({ data: result, loading: false, error: null })
        return result
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        setState({ data: null, loading: false, error: errorMessage })
        return null
      }
    },
    [asyncFunction]
  )

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null })
  }, [])

  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }))
  }, [])

  return {
    ...state,
    execute,
    reset,
    setData,
  }
}

/**
 * 简化版 - 立即执行的异步操作
 * 适用于组件挂载时立即执行的场景
 *
 * @example
 * const { data, loading, error, refetch } = useAsyncImmediate(fetchUserData)
 */
export function useAsyncImmediate<T = unknown>(
  asyncFunction: () => Promise<T>
): UseAsyncReturn<T, []> & { refetch: () => Promise<T | null> } {
  const asyncResult = useAsync(asyncFunction)

  // 组件挂载时立即执行
  useState(() => {
    asyncResult.execute()
  })

  return {
    ...asyncResult,
    refetch: asyncResult.execute,
  }
}
