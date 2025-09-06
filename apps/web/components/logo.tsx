import Image from 'next/image'

export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-8 h-8 rounded-lg overflow-hidden">
        <Image
          src="/logo.jpg"
          alt="Fomora Logo"
          width={32}
          height={32}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="text-xl font-heading font-bold text-foreground">
        Fomora
      </span>
    </div>
  )
}
