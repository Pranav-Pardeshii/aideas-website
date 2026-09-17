import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about" },
  { name: "Events", href: "/events" },
  { name: "Members", href: "/members" },
]

// Vite-compatible Link helper
function Link({
  href,
  children,
  className,
  onClick,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a href={href} className={className} onClick={onClick} {...props}>
      {children}
    </a>
  )
}

// Vite-compatible usePathname helper
function usePathname() {
  const [pathname, setPathname] = useState(() =>
    typeof window !== "undefined" ? window.location.pathname : "/"
  )

  useEffect(() => {
    const handleLocationChange = () => setPathname(window.location.pathname)
    window.addEventListener("popstate", handleLocationChange)
    return () => window.removeEventListener("popstate", handleLocationChange)
  }, [])

  return pathname
}

export function Navigation() {
  const [isVisible, setIsVisible] = useState(true)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const isMobileMenuOpenRef = useRef(false)
  const pathname = usePathname()
  const { scrollY } = useScroll()

  // Track scroll position and direction with threshold to prevent stutter/jitter
  const lastScrollY = useRef(0)
  const lastDirectionChangeY = useRef(0)
  const isScrollingDown = useRef(false)

  useEffect(() => {
    isMobileMenuOpenRef.current = isMobileMenuOpen
  }, [isMobileMenuOpen])

  // Smooth, jitter-free scroll change handler — batch state updates
  const handleScrollChange = useCallback((latest: number) => {
    if (isMobileMenuOpenRef.current) {
      setIsVisible(true)
      return
    }

    let nextScrolled: boolean | null = null
    let nextVisible: boolean | null = null

    if (latest > 35) nextScrolled = true
    else if (latest < 15) nextScrolled = false

    if (latest <= 90) {
      nextVisible = true
      lastScrollY.current = latest
      lastDirectionChangeY.current = latest
      if (nextScrolled !== null) {
        setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled))
      }
      setIsVisible((prev) => (prev ? prev : true))
      return
    }

    const prevY = lastScrollY.current
    const delta = latest - prevY

    if (delta > 0 && !isScrollingDown.current) {
      isScrollingDown.current = true
      lastDirectionChangeY.current = latest
    } else if (delta < 0 && isScrollingDown.current) {
      isScrollingDown.current = false
      lastDirectionChangeY.current = latest
    }

    const distanceSinceDirectionChange = Math.abs(latest - lastDirectionChangeY.current)

    if (distanceSinceDirectionChange > 15) {
      if (isScrollingDown.current && latest > 150) nextVisible = false
      else if (!isScrollingDown.current) nextVisible = true
    }

    lastScrollY.current = latest

    if (nextScrolled !== null) {
      setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled))
    }
    if (nextVisible !== null) {
      setIsVisible((prev) => (prev === nextVisible ? prev : nextVisible))
    }
  }, [])

  useMotionValueEvent(scrollY, "change", handleScrollChange)

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize, { passive: true })
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={isMobile ? { y: 0, opacity: 1 } : { 
          y: isVisible ? 0 : -120,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{ 
          y: { type: "spring", stiffness: 280, damping: 28, mass: 0.6 },
          opacity: { duration: 0.25 },
        }}
        style={{ willChange: "transform" }}
        className={`fixed z-50 inset-x-0 mx-auto transition-[top,width,max-width,border-radius,background-color,border-color,box-shadow] duration-300 ease-out transform-gpu block ${
          isMobile
            ? "top-0 w-full rounded-none bg-[#10131a] border-b border-white/10"
            : isScrolled 
              ? "top-3 w-[90%] max-w-[1100px] rounded-full bg-[#10131a]/85 dark:bg-[#10131a]/85 backdrop-blur-xl border border-[#38d1ff]/30 shadow-xl shadow-[#38d1ff]/10" 
              : "top-4 sm:top-5 w-[95%] max-w-[1280px] rounded-[32px] bg-[#10131a]/60 dark:bg-[#10131a]/60 backdrop-blur-md border border-white/10 shadow-lg shadow-black/25"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/">
              <motion.div
                className="flex items-center gap-3 group cursor-pointer"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shadow-lg shadow-[#38d1ff]/20 border-2 border-[#38d1ff]/35 bg-[#141824] flex items-center justify-center p-1 group-hover:border-[#38d1ff]/60 group-hover:shadow-[#38d1ff]/40 transition-all duration-300">
                  <img
                    src="/assets/img/logo-icon.png"
                    alt="aIDEAS Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="block select-none">
                  <span className="font-['Audiowide',sans-serif] text-xl font-bold tracking-wider text-white">
                    <span className="text-[#38d1ff]">aI</span>
                    <span>DEAS</span>
                  </span>
                </div>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.name} href={link.href}>
                  <motion.div
                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 relative group cursor-pointer whitespace-nowrap ${
                      pathname === link.href 
                        ? "text-[#38d1ff]" 
                        : "text-slate-300 hover:text-[#38d1ff]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {link.name}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-gradient-to-r from-[#38d1ff] to-[#b06bff] shadow-[0_0_8px_rgba(56,209,255,0.7)] transition-all duration-300 ${
                      pathname === link.href ? "w-1/2" : "w-0 group-hover:w-1/2"
                    }`} />
                  </motion.div>
                </Link>
              ))}
              <Link href="/join">
                <motion.div 
                  whileHover={{ scale: 1.05 }} 
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <Button className="ml-4 bg-gradient-to-r from-[#22b8f0] via-[#38d1ff] to-[#9b5cff] hover:opacity-95 text-white font-medium shadow-lg shadow-[#38d1ff]/25 hover:shadow-[#38d1ff]/40 border-0 whitespace-nowrap">
                    Join Now
                  </Button>
                </motion.div>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <motion.button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-slate-200 hover:text-white bg-white/5 hover:bg-[#38d1ff]/15 border border-white/10 hover:border-[#38d1ff]/30 transition-colors cursor-pointer"
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 md:hidden"
          >
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 350, damping: 30 }}
              className="absolute top-[88px] sm:top-[96px] left-4 right-4 bg-[#10131a]/95 backdrop-blur-2xl rounded-2xl shadow-2xl shadow-black/80 border border-[#38d1ff]/30 p-5 sm:p-6"
            >
              <div className="flex flex-col gap-2">
                {navLinks.map((link, index) => (
                  <Link key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.06, type: "spring", stiffness: 350, damping: 28 }}
                      className={`text-left px-4 py-3 rounded-xl font-medium transition-colors whitespace-nowrap overflow-hidden text-ellipsis ${
                        pathname === link.href 
                          ? "bg-[#38d1ff]/15 text-[#38d1ff] border border-[#38d1ff]/30 shadow-[0_0_15px_rgba(56,209,255,0.15)]" 
                          : "text-slate-200 hover:bg-[#38d1ff]/10 hover:text-[#38d1ff] border border-transparent"
                      }`}
                    >
                      {link.name}
                    </motion.div>
                  </Link>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.28, type: "spring", stiffness: 350, damping: 28 }}
                  className="mt-4"
                >
                  <Link href="/join" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-[#22b8f0] via-[#38d1ff] to-[#9b5cff] hover:opacity-95 text-white font-medium shadow-lg shadow-[#38d1ff]/25 whitespace-nowrap py-3">
                      Join Now
                    </Button>
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Export both Navbar and Navigation for maximum compatibility
export const Navbar = Navigation
