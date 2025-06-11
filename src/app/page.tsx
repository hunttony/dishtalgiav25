'use client';

import Image from 'next/image';
import Link from 'next/link';

// Sample product data - in a real app, this would come from an API or CMS
const featuredProducts = [
  {
    id: 1,
    name: "Original Banana Pudding",
    description: "Classic Southern comfort with creamy vanilla pudding, ripe bananas, and crunchy Nilla wafers.",
    price: 8.00,
    slug: "original",
    image: "/images/dishtalgiaoriginal.png"
  },
  {
    id: 2,
    name: "Bananas Foster Pudding",
    description: "A decadent twist with caramelized bananas, rum-infused sauce, and a graham cracker crust.",
    price: 10.00,
    slug: "bananas-foster",
    image: "/images/dishtalgia-2.webp"
  },
  {
    id: 3,
    name: "Mississippi Mud Pudding",
    description: "Rich chocolate pudding layered with cookie crumbles and whipped cream.",
    price: 10.00,
    slug: "mississippi-mud",
    image: "/images/mississippi-mud.png"
  }
];

// Sample testimonials
const testimonials = [
  {
    id: 1,
    quote: "The best banana pudding I've ever had! Takes me back to my childhood in the South.",
    author: "Sarah M.",
    location: "Houston, TX"
  },
  {
    id: 2,
    quote: "The Bananas Foster pudding is absolutely divine! Perfect balance of flavors.",
    author: "James T.",
    location: "Katy, TX"
  },
  {
    id: 3,
    quote: "My family can't get enough of the Mississippi Mud. We order it every week!",
    author: "Maria G.",
    location: "The Woodlands, TX"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-cover bg-center" 
               style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}>
        <div className="absolute inset-0 bg-chocolate-brown/60 flex items-center justify-center">
          <div className="text-center text-warm-white px-4 max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-6">
              Indulge in Nostalgia
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">
              Handcrafted banana puddings that bring the taste of Southern comfort to your table.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/products" 
                className="bg-soft-red hover:bg-golden-yellow text-warm-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300"
              >
                Shop Now
              </Link>
              <Link 
                href="/about" 
                className="border-2 border-warm-white hover:bg-warm-white/10 text-warm-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300"
              >
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 md:py-24 bg-cream-beige">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-chocolate-brown mb-4">
              Our Signature Puddings
            </h2>
            <div className="w-20 h-1 bg-golden-yellow mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-64 w-full">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-playfair font-bold text-chocolate-brown mb-2">
                    {product.name}
                  </h3>
                  <p className="text-chocolate-brown/80 mb-4">
                    {product.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-soft-red">
                      ${product.price.toFixed(2)}
                    </span>
                    <Link 
                      href={`/products/${product.slug}`}
                      className="text-chocolate-brown hover:text-golden-yellow font-semibold transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link 
              href="/products" 
              className="inline-block bg-chocolate-brown hover:bg-golden-yellow text-warm-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300"
            >
              View All Puddings
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-24 bg-chocolate-brown text-warm-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              What Our Customers Say
            </h2>
            <div className="w-20 h-1 bg-golden-yellow mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-warm-white/10 p-6 rounded-lg">
                <div className="text-golden-yellow text-4xl mb-4">"</div>
                <p className="text-lg italic mb-4">{testimonial.quote}</p>
                <div className="font-bold">{testimonial.author}</div>
                <div className="text-sm text-warm-white/70">{testimonial.location}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-soft-red text-warm-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6">
            Ready to Taste the Difference?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Order now and experience the taste of Southern comfort delivered to your door.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/products" 
              className="bg-warm-white text-soft-red hover:bg-chocolate-brown font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300"
            >
              Shop Now
            </Link>
            <Link 
              href="/contact" 
              className="border-2 border-warm-white hover:bg-warm-white/10 font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
