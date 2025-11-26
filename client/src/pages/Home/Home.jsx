import React from "react";

const Home = () => {
  return (
    <main className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-green-600 text-white py-24">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Empowering Communities, Changing Lives
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Join us in our mission to provide education, healthcare, and support to those in need.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="/donate"
              className="bg-white text-green-600 font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition"
            >
              Donate Now
            </a>
            <a
              href="/volunteer"
              className="border border-white text-white font-semibold px-6 py-3 rounded hover:bg-white hover:text-green-600 transition"
            >
              Volunteer
            </a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center md:text-left">
          <h2 className="text-3xl font-bold mb-8 text-center md:text-left">About Us</h2>
          <p className="text-gray-700 max-w-3xl mx-auto md:mx-0">
            We are a non-profit organization dedicated to improving lives through education, healthcare, and community programs. 
            Our goal is to create lasting impact by empowering the most vulnerable members of society.
          </p>
        </div>
      </section>

      {/* Programs / Features Section */}
      <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Our Programs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Education</h3>
              <p>Providing quality education and resources to children in underserved communities.</p>
            </div>
            <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Healthcare</h3>
              <p>Access to medical care, health awareness programs, and vaccination drives.</p>
            </div>
            <div className="bg-white p-6 rounded shadow hover:shadow-lg transition">
              <h3 className="text-xl font-semibold mb-3">Community Support</h3>
              <p>Empowering communities with vocational training, shelter, and disaster relief.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-12">Stories of Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded shadow">
              <p className="italic mb-4">
                "Thanks to the NGO, I was able to continue my education and dream big."
              </p>
              <span className="font-semibold">- Amina S.</span>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <p className="italic mb-4">
                "The healthcare program helped my village get access to essential medical services."
              </p>
              <span className="font-semibold">- Rahim K.</span>
            </div>
            <div className="bg-white p-6 rounded shadow">
              <p className="italic mb-4">
                "Volunteering with this NGO has been the most rewarding experience of my life."
              </p>
              <span className="font-semibold">- Maya L.</span>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-green-600 text-white py-20 text-center">
        <h2 className="text-3xl font-bold mb-6">Support Our Mission Today</h2>
        <div className="flex justify-center gap-4">
          <a
            href="/donate"
            className="bg-white text-green-600 font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition"
          >
            Donate Now
          </a>
          <a
            href="/volunteer"
            className="border border-white text-white font-semibold px-6 py-3 rounded hover:bg-white hover:text-green-600 transition"
          >
            Volunteer
          </a>
        </div>
      </section>
    </main>
  );
};

export default Home;
