import React from "react";

const Home = () => {
  return (
    <main className="min-h-screen bg-orange-500 flex items-center justify-center px-4 py-10">
      {/* Main content container */}
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* HERO SECTION (No Navbar Above) */}
        <section className="relative px-6 sm:px-10 py-10 sm:py-14 md:py-16 bg-[#f4f0e7]">
          <div className="grid md:grid-cols-[1.1fr_1.3fr_0.8fr] gap-8 items-center">

            {/* Left big food image */}
            <div className="flex justify-center md:justify-start">
              <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-full overflow-hidden shadow-lg">
                <img
                  src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Vegan burger"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Center text */}
            <div className="text-center md:text-left">
              <p className="uppercase text-xs tracking-[0.45em] text-gray-500 mb-3">
                Joy Jatra Food Corner
              </p>

              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-orange-500">
                Taste
              </h1>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-800 mb-4">
                Organic
              </h1>

              <p className="text-gray-600 max-w-md mx-auto md:mx-0 mb-6 text-sm sm:text-base">
                Fresh, plant-based meals crafted with organic ingredients and bursting with flavor.
              </p>

              <button className="inline-flex items-center gap-2 bg-gray-900 text-white px-7 py-3 rounded-full text-sm font-semibold shadow hover:bg-gray-800 transition">
                Order Now
              </button>
            </div>

            {/* Right image + discount badge */}
            <div className="flex flex-col items-center md:items-end gap-4 relative">

              {/* Discount badge */}
              <div className="absolute -top-4 right-4 md:static md:self-end">
                <div className="w-20 h-20 rounded-full bg-orange-500 text-white flex flex-col items-center justify-center text-xs font-bold shadow-lg">
                  <span>50%</span>
                  <span>OFF</span>
                </div>
              </div>

              {/* Food bowl image */}
              <div className="mt-10 md:mt-0 w-40 h-40 sm:w-48 sm:h-48 rounded-full overflow-hidden shadow-lg">
                <img
                  src="https://images.pexels.com/photos/1438672/pexels-photo-1438672.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Vegan bowl"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="mt-4 text-[10px] uppercase tracking-[0.18em] text-gray-500 text-center">
                Healthy • Fresh • Cruelty Free
              </div>
            </div>

          </div>

          {/* Slider dots */}
          <div className="flex justify-center mt-10 gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="w-2 h-2 rounded-full bg-gray-300" />
          </div>
        </section>

      </div>
    </main>
  );
};

export default Home;
