import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export const MDXComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-4xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-3xl font-semibold mt-6 mb-3 text-gray-800 dark:text-gray-100" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-2xl font-semibold mt-5 mb-2 text-gray-800 dark:text-gray-100" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-base leading-7 mb-4 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </p>
  ),
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <Link
      href={href || '#'}
      className="text-blue-600 hover:text-blue-800 underline dark:text-blue-400"
      {...props}
    >
      {children}
    </Link>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="ml-4" {...props}>
      {children}
    </li>
  ),
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono text-red-600 dark:text-red-400"
      {...props}
    >
      {children}
    </code>
  ),
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre
      className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm"
      {...props}
    >
      {children}
    </pre>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-4 border-blue-500 pl-4 italic my-4 text-gray-600 dark:text-gray-400"
      {...props}
    >
      {children}
    </blockquote>
  ),
  img: ({ src, alt, width, height, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <Image
      src={src || ''}
      alt={alt || ''}
      width={800}
      height={400}
      className="rounded-lg my-4"
      {...props}
    />
  ),
  table: ({ children, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-4">
      <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700" {...props}>
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="border border-gray-300 dark:border-gray-700 px-4 py-2" {...props}>
      {children}
    </td>
  ),
}
