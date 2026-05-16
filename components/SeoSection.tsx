'use client'

export default function SeoSection({ htmlContent }: { htmlContent: string }) {
  if (!htmlContent) return null

  return (
    <section className="mt-20 border-t border-primary-blue/10 pt-16">
      <div 
        className="prose prose-slate max-w-none prose-headings:text-primary-blue prose-headings:font-bold prose-headings:tracking-tight prose-a:text-accent-blue prose-strong:text-primary-blue prose-p:leading-relaxed text-slate-600"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </section>
  )
}
