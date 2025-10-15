import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { MDXComponents } from './MDXComponents'

interface BlogContentProps {
  source: MDXRemoteSerializeResult
}

export default function BlogContent({ source }: BlogContentProps) {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
      <MDXRemote {...source} components={MDXComponents} />
    </article>
  )
}
