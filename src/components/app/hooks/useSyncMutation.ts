import { useMutation } from '@tanstack/react-query'
type TUseSyncMutation = typeof useMutation
/**
 * Custom hook that wraps the `useMutation` hook to provide synchronous mutation control.
 * Prevents concurrent mutations by checking if a mutation is already pending before allowing new ones.
 *
 * @param options - Mutation options to be passed to `useMutation`.
 * @param queryClient - The query client instance for managing queries and mutations.
 * @returns An object containing all properties from the original mutation result,
 *          with overridden `mutateAsync` and `mutate` methods that prevent concurrent execution.
 *
 * @remarks
 * - The `mutateAsync` method throws an error if a mutation is already pending.
 * - The `mutate` method does nothing if a mutation is already pending.
 * - Useful for scenarios where only one mutation should be processed at a time.
 */
export const useSyncMutation: TUseSyncMutation = (options, queryClient) => {
  const result = useMutation(options, queryClient)
  const appMutateAsync: typeof result.mutateAsync = async (
    variables,
    options
  ) => {
    if (!result.isPending) return await result.mutateAsync(variables, options)
    throw 'Current Mutation is Pending'
  }
  const appMutate: typeof result.mutate = (variables, options) => {
    if (!result.isPending) result.mutate(variables, options)
  }
  return {
    ...result,
    mutateAsync: appMutateAsync,
    mutate: appMutate,
  }
}
