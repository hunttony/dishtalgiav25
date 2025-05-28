import Image from 'next/image';
import Link from 'next/link';

// Mock product data - in a real app, this would come from an API or CMS
const products = [
  {
    id: 1,
    name: "Original Banana Pudding",
    slug: "original",
    description: "Classic Southern comfort with creamy vanilla pudding, ripe bananas, and crunchy Nilla wafers.",
    price: 8.00,
    image: "/images/IMG_2016-removebg-preview (2).png"
  },
  {
    id: 2,
    name: "Bananas Foster Pudding",
    slug: "bananas-foster",
    description: "A decadent twist with caramelized bananas, rum-infused sauce, and a graham cracker crust.",
    price: 10.00,
    image: "/images/dishtalgia-2.webp"
  },
  {
    id: 3,
    name: "Mississippi Mud Pudding",
    slug: "mississippi-mud",
    description: "Rich chocolate pudding layered with cookie crumbles and whipped cream.",
    price: 10.00,
    image: "/images/mississippi-mud.png"
  }
];

export default function ProductsPage() {
  return (
    <div className="py-12 bg-cream-beige">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-playfair font-bold text-chocolate-brown mb-4">
            Our Delicious Puddings
          </h1>
          <div className="w-20 h-1 bg-golden-yellow mx-auto mb-8"></div>
          <p className="text-xl text-chocolate-brown/80 max-w-3xl mx-auto">
            Handcrafted with love using the finest ingredients. Each pudding is made fresh to order.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
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
                <h2 className="text-2xl font-playfair font-bold text-chocolate-brown mb-2">
                  {product.name}
                </h2>
                <p className="text-chocolate-brown/80 mb-4">
                  {product.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-soft-red">
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

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-playfair font-bold text-chocolate-brown mb-6">
            Special Requests?
          </h2>
          <p className="text-chocolate-brown/80 mb-6 max-w-2xl mx-auto">
            Have a special occasion or dietary restrictions? Contact us for custom orders and we'll do our best to accommodate your needs.
          </p>
          <Link 
            href="/contact" 
            className="inline-block bg-chocolate-brown hover:bg-golden-yellow text-warm-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
