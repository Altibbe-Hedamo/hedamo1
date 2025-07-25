import { Link } from 'react-router-dom';
import heroBackground from '/homepage.webp';
import Footer from '../components/Footer';
import React from 'react'; // Added for React.useState
import CategoryMasonry from './CategoryMasonry';

function Home() {
  // (removed unused API_URL)

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      {/* Hero Section */}
      <section
        className="relative h-screen bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url(${heroBackground})`,
        }}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-8 tracking-wide drop-shadow-lg">FUEL YOUR BODY. FEED YOUR SOUL</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/products"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300"
            >
              Explore Products
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white hover:bg-white hover:text-green-700 px-8 py-3 rounded-full text-lg font-semibold bg-transparent transition-all duration-300"
            >
              Our Story
            </Link>
          </div>
        </div>
      </section>

      {/* Overlapping Happy Customers Section - sits in the valley of the wave, with better spacing and background */}
      <section className="relative z-10 flex flex-col items-center justify-center">
        <div className="bg-[#d6f5e3] w-full flex flex-col items-center justify-center rounded-t-3xl shadow-lg pt-20 pb-12 px-4 mt-0">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold text-green-900 mb-6 drop-shadow-xl" style={{textShadow: '0 6px 24px #b2e2c7, 0 2px 8px #fff'}}>Over 100,000 Happy<br />Customers</h2>
            <p className="text-lg text-green-800 mb-4 font-medium">
              "Since 2020, We've Been Creating Feel-Good Nutrition Guided By Nature And Wisdom."
            </p>
            <p className="text-green-700">Thank You For Being Part Of Our Journey</p>
          </div>
        </div>
      </section>

      {/* Shop By Category */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="w-12 h-1 bg-green-600 mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900">Shop By Category</h2>
            </div>
            <Link to="/products" className="text-gray-400 hover:text-green-600 transition-colors">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>

          <CategoryMasonry />
        </div>
      </section>

      {/* The Story Behind The Smile */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="w-12 h-1 bg-green-600 mb-4"></div>
            <h2 className="text-3xl font-bold text-gray-900">The Story Behind The Smile</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Link
              to="/about"
              className="group overflow-hidden hover:shadow-lg transition-shadow rounded-lg border border-gray-200"
            >
              <div className="aspect-square relative">
                <img
                  src="/h2.jpg"
                  alt="Our Origins"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Our Origins</h3>
              </div>
            </Link>

            <Link
              to="/services"
              className="group overflow-hidden hover:shadow-lg transition-shadow rounded-lg border border-gray-200"
            >
              <div className="aspect-square relative">
                <img
                  src="/h1.jpg"
                  alt="How We Create"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">How We Create</h3>
              </div>
            </Link>

            <Link
              to="/about"
              className="group overflow-hidden hover:shadow-lg transition-shadow rounded-lg border border-gray-200"
            >
              <div className="aspect-square relative">
                <img
                  src="/us2.jpg"
                  alt="Why It Matters"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-green-600 transition-colors">Why It Matters</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* What Our Clients Say - horizontal scrollable slider */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="w-12 h-1 bg-green-600 mb-4"></div>
            <h2 className="text-3xl font-bold text-gray-900">What Our Clients Say</h2>
          </div>
          <TestimonialSlider />
        </div>
      </section>

      {/* Join Us Section */}
      <section className="relative flex items-center justify-center py-24 px-4 overflow-hidden" style={{minHeight: '480px', marginTop: 0}}>
        {/* Large green oval background flush with top */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-[140vw] h-[80vw] max-w-[1800px] max-h-[700px] bg-green-100 rounded-b-full z-0" style={{filter: 'blur(0px)', top: 0}}></div>
        <div className="relative max-w-3xl w-full text-center z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-green-900 mb-6 italic drop-shadow-lg">
            Become <span className="text-green-700">A Part Of The Hedamo Family</span>
          </h2>
          <p className="text-lg text-green-800 mb-8 font-medium">
            At Hedamo, We Believe Small Choices Lead To Big Change — And It Starts With Us.
          </p>
          <Link
            to="/signup"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-12 py-4 rounded-full text-lg font-bold shadow-md transition-all duration-300"
          >
            Join Us
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

function TestimonialSlider() {
  const testimonials = [
    {
      quote: "Hedamo helped me find reliable freelancers for my startup...",
      name: "Amit Sharma",
      role: "Startup Founder",
      img: "/img/testimonial1.jpg"
    },
    {
      quote: "As a freelancer, Hedamo has given me consistent job opportunities...",
      name: "Neha Patel",
      role: "Freelance Graphic Designer",
      img: "/img/testimonial2.jpg"
    },
    {
      quote: "Finding skilled professionals for SEO and content writing...",
      name: "Rahul Verma",
      role: "Digital Marketer",
      img: "/img/testimonial3.jpg"
    },
    {
      quote: "Great platform for remote work! I found a long-term client...",
      name: "Priya Iyer",
      role: "Content Writer",
      img: "/img/testimonial4.webp"
    },
    {
      quote: "Hedamo made hiring a web developer effortless...",
      name: "Vikram Mehta",
      role: "E-commerce Business Owner",
      img: "/img/testimonial5.webp"
    },
    {
      quote: "The platform's UI is very intuitive...",
      name: "Karan Malhotra",
      role: "Project Manager",
      img: "/img/testimonial6.webp"
    },
    {
      quote: "I landed my first freelance gig through Hedamo...",
      name: "Sneha Reddy",
      role: "Frontend Developer",
      img: "/img/testimonial7.webp"
    }
  ];
  const [start, setStart] = React.useState(0);
  const visibleCount = 3;
  const canGoLeft = start > 0;
  const canGoRight = start + visibleCount < testimonials.length;

  const handleLeft = () => {
    if (canGoLeft) setStart(start - 1);
  };
  const handleRight = () => {
    if (canGoRight) setStart(start + 1);
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-center mb-6">
        <button
          onClick={handleLeft}
          disabled={!canGoLeft}
          className={`rounded-full p-2 mx-2 bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={handleRight}
          disabled={!canGoRight}
          className={`rounded-full p-2 mx-2 bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-30 disabled:cursor-not-allowed`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {testimonials.slice(start, start + visibleCount).map((testimonial, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-lg border border-green-100 flex flex-col items-center">
            <img src={testimonial.img} alt={testimonial.name} className="w-20 h-20 rounded-full border-4 border-green-100 object-cover mb-4" />
            <p className="text-gray-700 italic mb-4 text-center">"{testimonial.quote}"</p>
            <div className="text-green-800 font-bold">{testimonial.name}</div>
            <div className="text-sm text-gray-500">{testimonial.role}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;