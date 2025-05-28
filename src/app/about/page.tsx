import Image from 'next/image';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-cream-beige">
      {/* Hero Section */}
      <section className="relative h-96 flex items-center justify-center bg-cover bg-center" 
               style={{ backgroundImage: "url('/images/about-hero.jpg')" }}>
        <div className="absolute inset-0 bg-chocolate-brown/60 flex items-center justify-center">
          <div className="text-center text-warm-white px-4">
            <h1 className="text-4xl md:text-6xl font-playfair font-bold mb-6">
              Our Story
            </h1>
            <p className="text-xl md:text-2xl max-w-2xl mx-auto">
              Bringing Southern comfort to your table, one spoonful at a time.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex items-center gap-12">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <div className="relative h-96 rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/founder.png"
                  alt="Our Founder"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="lg:w-1/2">
              <h2 className="text-3xl md:text-4xl font-playfair font-bold text-chocolate-brown mb-6">
                A Taste of Tradition
              </h2>
              <div className="space-y-4 text-chocolate-brown/90">
                <p>
                  Founded in 2023, Dishtalgia was born from a deep love for Southern comfort food and the cherished memories that come with it. Our founder, Tennisha White, born in Riverside, California, grew up in a small Louisiana town and finally Houston, Texas where her grandmother's banana pudding was the highlight of every family gathering.
                </p>
                <p>
                  After years of perfecting her grandmother's recipe and adding her own creative twists, Tennisha decided to share these delicious creations with the world. What started as a small home-based business quickly grew into a beloved local favorite, and now we're proud to serve our puddings to customers across the country.
                </p>
                <p>
                  Each of our puddings is made with the same love and attention to detail that goes into a homemade dessert. We source only the finest ingredients, from ripe, fresh bananas to premium vanilla and chocolate, ensuring every bite is pure bliss.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 md:py-24 bg-chocolate-brown text-warm-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-4">
              Our Values
            </h2>
            <div className="w-20 h-1 bg-golden-yellow mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Quality Ingredients',
                description: 'We use only the finest, freshest ingredients in all our puddings, with no artificial flavors or preservatives.'
              },
              {
                title: 'Handcrafted with Love',
                description: 'Each pudding is made in small batches with the same care and attention as if we were making it for our own family.'
              },
              {
                title: 'Community Focused',
                description: 'We believe in giving back to our community and supporting local farmers and businesses whenever possible.'
              }
            ].map((value, index) => (
              <div key={index} className="bg-warm-white/10 p-8 rounded-lg">
                <h3 className="text-2xl font-playfair font-bold text-golden-yellow mb-4">
                  {value.title}
                </h3>
                <p className="text-warm-white/90">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold text-chocolate-brown mb-4">
              Meet Our Team
            </h2>
            <div className="w-20 h-1 bg-golden-yellow mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Tennisha White',
                role: 'Founder & Head Chef',
                bio: 'The creative force behind our signature recipes, Tennisha brings years of culinary expertise and a passion for comfort food to every dessert.',
                image: '/images/founder.png'
              },
              {
                name: 'Antonio Hunt',
                role: 'Operations & Technical',
                bio: 'With a background in Operations and Technical processes, Antonio adds his expertise to create the perfect texture and balance in every spoonful.',
                image: '/images/antonio.jpg'
              },

            ].map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative h-64 w-64 mx-auto mb-6 rounded-full overflow-hidden border-4 border-golden-yellow">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="text-2xl font-playfair font-bold text-chocolate-brown">
                  {member.name}
                </h3>
                <p className="text-soft-red font-semibold mb-2">{member.role}</p>
                <p className="text-chocolate-brown/80">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
