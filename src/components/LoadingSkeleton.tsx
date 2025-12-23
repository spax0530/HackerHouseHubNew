export function HouseCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm overflow-hidden animate-pulse border border-gray-100 dark:border-gray-800">
      {/* Image skeleton */}
      <div className="w-full aspect-[4/3] bg-gray-200 dark:bg-gray-800" />
      
      {/* Content skeleton */}
      <div className="p-4 md:p-5 space-y-2.5 md:space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
        </div>
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="flex items-center gap-4">
          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded" />
        <div className="h-9 w-full bg-gray-200 dark:bg-gray-800 rounded-lg mt-3" />
      </div>
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-4 py-3">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
      </td>
    </tr>
  )
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-sm animate-pulse">
      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
      <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-1" />
      <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
    </div>
  )
}

