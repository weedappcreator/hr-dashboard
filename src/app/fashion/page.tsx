"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const collections = [
  {
    id: "couture",
    name: "Haute Couture",
    subtitle: "Spring 2026",
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&h=1200&fit=crop",
    tagline: "Where artistry meets elegance",
  },
  {
    id: "ready",
    name: "Ready to Wear",
    subtitle: "Seasonless",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1200&fit=crop",
    tagline: "Effortless sophistication",
  },
  {
    id: "accessories",
    name: "Accessories",
    subtitle: "The Finishing Touch",
    image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=800&h=1200&fit=crop",
    tagline: "Bold statements",
  },
];

const products = [
  {
    id: 1,
    name: "Draped Silk Gown",
    brand: "ATELIER NOIR",
    price: 2400,
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=900&fit=crop",
    year: "2026",
  },
  {
    id: 2,
    name: "Structure Blazer",
    brand: "MAISON CLAUDE",
    price: 1850,
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=900&fit=crop",
    year: "2026",
  },
  {
    id: 3,
    name: "Cashmere Wrap",
    brand: "ATELIER NOIR",
    price: 980,
    image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600&h=900&fit=crop",
    year: "2025",
  },
  {
    id: 4,
    name: "Wide Leg Trouser",
    brand: "MAISON CLAUDE",
    price: 720,
    image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&h=900&fit=crop",
    year: "2026",
  },
];

const editorial = [
  { title: "The New Silhouette", page: "42" },
  { title: "Color Theory", page: "56" },
  { title: "Sustainable Luxury", page: "78" },
];

export default function FashionEditorial() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f0e8] text-[#1a1a1a] overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Italiana&display=swap');

        :root {
          --cream: #f5f0e8;
          --black: #0a0a0a;
          --gold: #c9a227;
          --burgundy: #722f37;
        }

        .font-display {
          font-family: 'Cormorant Garamond', serif;
        }
        .font-body {
          font-family: 'Libre Baskerville', serif;
        }
        .font-accent {
          font-family: 'Italiana', serif;
        }

        .reveal {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal.active {
          opacity: 1;
          transform: translateY(0);
        }

        .stagger-1 { transition-delay: 0.1s; }
        .stagger-2 { transition-delay: 0.2s; }
        .stagger-3 { transition-delay: 0.3s; }
        .stagger-4 { transition-delay: 0.4s; }
        .stagger-5 { transition-delay: 0.5s; }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .line-reveal {
          position: relative;
          overflow: hidden;
        }
        .line-reveal::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: #f5f0e8;
          transform: translateY(100%);
          animation: lineReveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: var(--delay, 0s);
        }
        @keyframes lineReveal {
          to { transform: translateY(0); }
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${scrolled ? 'bg-[#f5f0e8]/95 backdrop-blur-sm py-4' : 'bg-transparent py-8'}`}>
        <div className="max-w-[1800px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <button onClick={() => setMenuOpen(!menuOpen)} className="group flex items-center gap-3 cursor-pointer">
            <span className="w-8 h-[1px] bg-[#1a1a1a] group-hover:w-12 transition-all duration-300" />
            <span className="text-sm font-accent tracking-[0.2em]">MENU</span>
          </button>

          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h1 className={`font-display text-2xl md:text-3xl tracking-[0.3em] transition-all duration-500 ${scrolled ? 'text-[#1a1a1a]' : 'text-[#f5f0e8]'}`}>
              MAISON
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button className={`text-sm font-accent tracking-[0.15em] transition-colors ${scrolled ? 'text-[#1a1a1a]' : 'text-[#f5f0e8]'}`}>
              SEARCH
            </button>
            <button className={`text-sm font-accent tracking-[0.15em] transition-colors ${scrolled ? 'text-[#1a1a1a]' : 'text-[#f5f0e8]'}`}>
              BAG (0)
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Menu */}
      <div className={`fixed inset-0 z-40 bg-[#0a0a0a] transition-transform duration-700 ${menuOpen ? 'translate-y-0' : '-translate-y-full'}`}>
        <div className="h-full flex flex-col justify-center items-center">
          <nav className="text-center space-y-8">
            {['Collection', 'Couture', 'Accessories', 'Editorial', 'About', 'Contact'].map((item, i) => (
              <a
                key={item}
                href="#"
                className={`block font-display text-5xl md:text-7xl text-[#f5f0e8] hover:text-[#c9a227] transition-colors duration-300 reveal ${loaded ? 'active' : ''}`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
        <button onClick={() => setMenuOpen(false)} className="absolute top-8 right-6 text-[#f5f0e8] font-accent tracking-widest text-sm">
          CLOSE
        </button>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&h=1080&fit=crop"
            alt="Hero"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/30" />
        </div>

        <div className="relative z-10 text-center text-[#f5f0e8] px-6">
          <p className={`font-accent tracking-[0.5em] text-sm mb-6 reveal ${loaded ? 'active' : ''}`}>
            SPRING / SUMMER 2026
          </p>
          <h2 className={`font-display text-7xl md:text-[10rem] leading-[0.85] reveal stagger-1 ${loaded ? 'active' : ''}`}>
            THE ART
            <br />
            <span className="italic font-light">OF</span>
            <br />
            SILENCE
          </h2>
          <p className={`font-body text-lg mt-8 max-w-md mx-auto reveal stagger-2 ${loaded ? 'active' : ''}`}>
            Where minimalism meets maximum impact. A new chapter in luxury.
          </p>
          <a
            href="#collections"
            className={`inline-block mt-12 px-12 py-4 border border-[#f5f0e8] text-[#f5f0e8] font-accent tracking-[0.2em] text-sm hover:bg-[#f5f0e8] hover:text-[#0a0a0a] transition-all duration-500 reveal stagger-3 ${loaded ? 'active' : ''}`}
          >
            EXPLORE
          </a>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="font-accent tracking-widest text-[10px] text-[#f5f0e8]/60">SCROLL</span>
          <div className="w-[1px] h-16 bg-[#f5f0e8]/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1/2 bg-[#f5f0e8] animate-[float_2s_ease-in-out_infinite]" />
          </div>
        </div>
      </section>

      {/* Collections Grid */}
      <section id="collections" className="py-32 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div>
              <p className="font-accent tracking-[0.3em] text-xs text-[#c9a227] mb-4">DISCOVER</p>
              <h3 className="font-display text-5xl md:text-7xl">Collections</h3>
            </div>
            <p className="font-body text-[#1a1a1a]/60 max-w-md">
              Three distinct narratives. Each telling its own story of refined elegance and understated power.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#1a1a1a]">
            {collections.map((col, i) => (
              <div
                key={col.id}
                className={`group relative aspect-[3/4] overflow-hidden bg-[#f5f0e8] reveal ${loaded ? 'active' : ''}`}
                style={{ transitionDelay: `${i * 0.2}s` }}
              >
                <Image
                  src={col.image}
                  alt={col.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-[1.5s]"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-500" />
                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                  <p className="font-accent tracking-[0.3em] text-xs text-[#f5f0e8]/70 mb-2">{col.subtitle}</p>
                  <h4 className="font-display text-4xl text-[#f5f0e8] mb-2">{col.name}</h4>
                  <p className="font-body text-sm text-[#f5f0e8]/60 italic">{col.tagline}</p>
                </div>
                <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <span className="w-12 h-12 rounded-full border border-[#f5f0e8]/50 flex items-center justify-center text-[#f5f0e8]">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial Quote */}
      <section className="py-32 px-6 md:px-12 bg-[#0a0a0a] text-[#f5f0e8]">
        <div className="max-w-5xl mx-auto text-center">
          <p className="font-accent tracking-[0.3em] text-xs text-[#c9a227] mb-8">EDITORIAL</p>
          <blockquote className="font-display text-4xl md:text-6xl leading-[1.3] italic">
            &ldquo;Fashion is not about clothes. It&apos;s about a look. It&apos;s about defying expectations and creating your own narrative.&rdquo;
          </blockquote>
          <div className="mt-12 flex items-center justify-center gap-4">
            <div className="w-16 h-[1px] bg-[#c9a227]" />
            <span className="font-body text-sm text-[#f5f0e8]/50">Jean-Baptiste, Creative Director</span>
            <div className="w-16 h-[1px] bg-[#c9a227]" />
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-32 px-6 md:px-12">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop"
                alt="Featured"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 border border-[#1a1a1a]/10" />
              <div className="absolute -bottom-6 -right-6 w-32 h-32 md:w-48 md:h-48 bg-[#c9a227] flex items-center justify-center">
                <span className="font-display text-3xl md:text-4xl text-[#f5f0e8]">NEW</span>
              </div>
            </div>

            <div>
              <p className="font-accent tracking-[0.3em] text-xs text-[#c9a227] mb-4">FEATURED</p>
              <h3 className="font-display text-5xl md:text-6xl mb-6">
                The Collection
                <br />
                <span className="italic font-light">2026</span>
              </h3>
              <p className="font-body text-[#1a1a1a]/60 mb-8 leading-relaxed">
                Each piece in our collection tells a story of craftsmanship, attention to detail, and uncompromising quality. From the finest silks to the most delicate embroidery.
              </p>
              <div className="grid grid-cols-2 gap-8 mb-12">
                {[
                  { number: "156", label: "Pieces" },
                  { number: "12", label: "Artisans" },
                  { number: "8", label: "Weeks" },
                  { number: "100%", label: "Handmade" },
                ].map((stat, i) => (
                  <div key={i}>
                    <p className="font-display text-4xl text-[#c9a227]">{stat.number}</p>
                    <p className="font-accent tracking-widest text-xs text-[#1a1a1a]/50">{stat.label}</p>
                  </div>
                ))}
              </div>
              <a href="#" className="inline-block px-10 py-4 bg-[#0a0a0a] text-[#f5f0e8] font-accent tracking-[0.2em] text-sm hover:bg-[#c9a227] transition-colors duration-300">
                VIEW ALL
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-32 px-6 md:px-12 bg-[#f5f0e8]">
        <div className="max-w-[1800px] mx-auto">
          <div className="flex items-center justify-between mb-16">
            <div>
              <p className="font-accent tracking-[0.3em] text-xs text-[#c9a227] mb-2">SHOP</p>
              <h3 className="font-display text-4xl md:text-5xl">Latest Arrivals</h3>
            </div>
            <div className="hidden md:flex gap-8">
              <button className="font-body text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors">All</button>
              <button className="font-body text-sm text-[#1a1a1a] border-b border-[#c9a227] pb-1">Clothing</button>
              <button className="font-body text-sm text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition-colors">Accessories</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product, i) => (
              <div
                key={product.id}
                className={`group reveal ${loaded ? 'active' : ''}`}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                <div className="relative aspect-[3/4] overflow-hidden mb-4 bg-[#e8e4dc]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-[#0a0a0a] text-[#f5f0e8] text-[10px] font-accent tracking-widest">
                    {product.year}
                  </div>
                  <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <button className="w-full py-3 bg-[#f5f0e8] text-[#0a0a0a] font-accent tracking-[0.1em] text-xs hover:bg-[#c9a227] transition-colors">
                      ADD TO BAG
                    </button>
                  </div>
                </div>
                <p className="font-accent tracking-widest text-[10px] text-[#1a1a1a]/50 mb-1">{product.brand}</p>
                <h4 className="font-body text-[#1a1a1a] mb-2">{product.name}</h4>
                <p className="font-display text-lg">${product.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Magazine Section */}
      <section className="py-32 px-6 md:px-12 bg-[#0a0a0a] text-[#f5f0e8]">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&h=1000&fit=crop"
                  alt="Magazine"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom -right-4 md:right-8 bg-[#c9a227] p-8 md:p-12 max-w-xs">
                <p className="font-accent tracking-[0.3em] text-xs mb-4">IN THIS ISSUE</p>
                {editorial.map((item, i) => (
                  <div key={i} className="flex items-center gap-4 mb-3">
                    <span className="font-body text-sm text-[#f5f0e8]/70">p. {item.page}</span>
                    <span className="font-display text-lg">{item.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="font-accent tracking-[0.3em] text-xs text-[#c9a227] mb-4">THE JOURNAL</p>
              <h3 className="font-display text-5xl md:text-6xl mb-8">
                Read &amp;
                <br />
                <span className="italic font-light">Discover</span>
              </h3>
              <p className="font-body text-[#f5f0e8]/60 mb-8 leading-relaxed">
                Dive into our curated stories exploring the intersection of fashion, art, and culture. From emerging designers to timeless craftsmanship.
              </p>
              <div className="space-y-4">
                {[
                  "The Evolution of Minimalism",
                  "Sustainable Fashion's New Era",
                  "Artisan Crafts & Heritage",
                ].map((story, i) => (
                  <a
                    key={i}
                    href="#"
                    className="block flex items-center gap-4 group py-4 border-b border-[#f5f0e8]/20 hover:border-[#c9a227] transition-colors"
                  >
                    <span className="w-8 h-8 rounded-full border border-[#f5f0e8]/30 flex items-center justify-center text-xs font-accent group-hover:bg-[#c9a227] group-hover:border-[#c9a227] group-hover:text-[#0a0a0a] transition-all">
                      {i + 1}
                    </span>
                    <span className="font-body">{story}</span>
                    <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 px-6 md:px-12 bg-[#f5f0e8]">
        <div className="max-w-3xl mx-auto text-center">
          <p className="font-accent tracking-[0.3em] text-xs text-[#c9a227] mb-4">SUBSCRIBE</p>
          <h3 className="font-display text-4xl md:text-5xl mb-4">Join the Circle</h3>
          <p className="font-body text-[#1a1a1a]/60 mb-10">
            Be the first to know about new collections, exclusive events, and curated stories.
          </p>
          <form className="flex flex-col md:flex-row gap-4">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-6 py-4 bg-white border border-[#1a1a1a]/20 font-body text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:outline-none focus:border-[#c9a227]"
            />
            <button type="submit" className="px-10 py-4 bg-[#0a0a0a] text-[#f5f0e8] font-accent tracking-[0.2em] text-sm hover:bg-[#c9a227] transition-colors duration-300">
              SUBSCRIBE
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 md:px-12 bg-[#0a0a0a] text-[#f5f0e8]">
        <div className="max-w-[1800px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div>
              <h5 className="font-display text-2xl mb-6">MAISON</h5>
              <p className="font-body text-sm text-[#f5f0e8]/50">
                Refined luxury for the modern age. Crafted with intention, designed for impact.
              </p>
            </div>
            {[
              { title: "Explore", links: ["Collections", "Couture", "Accessories", "Archive"] },
              { title: "Information", links: ["About Us", "Sustainability", "Careers", "Press"] },
              { title: "Client Care", links: ["Contact", "Shipping", "Returns", "Size Guide"] },
            ].map((col, i) => (
              <div key={i}>
                <h6 className="font-accent tracking-[0.2em] text-xs text-[#c9a227] mb-4">{col.title}</h6>
                <ul className="space-y-3">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="font-body text-sm text-[#f5f0e8]/60 hover:text-[#f5f0e8] transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-[#f5f0e8]/10 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="font-body text-xs text-[#f5f0e8]/40">
              © 2026 Maison. All rights reserved.
            </p>
            <div className="flex gap-6">
              {["Instagram", "Pinterest", "LinkedIn"].map((social, i) => (
                <a key={i} href="#" className="font-accent tracking-widest text-xs text-[#f5f0e8]/40 hover:text-[#c9a227] transition-colors">
                  {social}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}