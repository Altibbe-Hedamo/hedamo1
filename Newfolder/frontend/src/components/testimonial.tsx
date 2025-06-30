import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  quote: string;
  name: string;
  role: string;
  img: string;
}

export const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const testimonials: Testimonial[] = [
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

  const rotateCarousel = (dir: 'next' | 'prev') => {
    const total = testimonials.length;
    setDirection(dir === 'next' ? 'right' : 'left');
    setCurrentIndex((prev) =>
      dir === 'next' ? (prev + 1) % total : (prev - 1 + total) % total
    );
  };

  useEffect(() => {
    const timer = setInterval(() => rotateCarousel('next'), 6000);
    return () => clearInterval(timer);
  }, []);

  const slideVariants = {
    hiddenRight: {
      x: '100%',
      opacity: 0,
    },
    hiddenLeft: {
      x: '-100%',
      opacity: 0,
    },
    visible: {
      x: '0',
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
    exit: {
      opacity: 0,
      x: direction === 'right' ? '-100%' : '100%',
      transition: {
        duration: 0.5,
      },
    },
  };

  const currentTestimonial = testimonials[currentIndex];
  const prevIndex = (currentIndex - 1 + testimonials.length) % testimonials.length;
  const nextIndex = (currentIndex + 1) % testimonials.length;

  return (
    <section className="container bg-white mx-auto py-20 px-4">
      <div className="text-center mb-16">
        <h2 className="text-5xl font-bold text-green-800 mb-4">Our Clients Say!</h2>
        <div className="w-24 h-1 bg-green-600 mx-auto mb-2"></div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Hear what our community has to say about their Hedamo experience
        </p>
      </div>

      <div className="relative max-w-4xl mx-auto">
        {/* Fade effect container */}
        <div className="relative overflow-hidden">
          {/* Left fade */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white via-white/90 to-transparent z-10"></div>
          
          {/* Right fade */}
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white via-white/90 to-transparent z-10"></div>
          
          {/* Carousel content */}
          <div className="relative flex items-center justify-center h-full">
            {/* Previous card (peeking 60% from left) */}
            <div className="absolute left-0 transform -translate-x-[40%] opacity-60 z-0 w-[60%]">
              <div className="bg-white p-6 rounded-xl shadow-xl border border-green-100">
                <div className="text-green-500 text-3xl mb-3 opacity-20">"</div>
                <p className="text-gray-700 mb-4 italic text-sm">{testimonials[prevIndex].quote}</p>
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={testimonials[prevIndex].img}
                      alt={testimonials[prevIndex].name}
                      className="w-12 h-12 rounded-full border-3 border-green-100 object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold text-green-800 text-sm">{testimonials[prevIndex].name}</h4>
                    <p className="text-xs text-gray-600">{testimonials[prevIndex].role}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main card */}
            <AnimatePresence custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                className="bg-white p-8 rounded-xl shadow-xl border border-green-100 hover:border-green-300 z-20 w-full max-w-xl"
                custom={direction}
                variants={slideVariants}
                initial={direction === 'right' ? 'hiddenRight' : 'hiddenLeft'}
                animate="visible"
                exit="exit"
              >
                <div className="text-green-500 text-4xl mb-4 opacity-20">"</div>
                <p className="text-gray-700 mb-6 italic">{currentTestimonial.quote}</p>
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={currentTestimonial.img}
                      alt={currentTestimonial.name}
                      className="w-16 h-16 rounded-full border-4 border-green-100 object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h4 className="font-bold text-green-800">{currentTestimonial.name}</h4>
                    <p className="text-sm text-gray-600">{currentTestimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Next card (peeking 60% from right) */}
            <div className="absolute right-0 transform translate-x-[40%] opacity-60 z-0 w-[60%]">
              <div className="bg-white p-6 rounded-xl shadow-xl border border-green-100">
                <div className="text-green-500 text-3xl mb-3 opacity-20">"</div>
                <p className="text-gray-700 mb-4 italic text-sm">{testimonials[nextIndex].quote}</p>
                <div className="flex items-center">
                  <div className="relative">
                    <img
                      src={testimonials[nextIndex].img}
                      alt={testimonials[nextIndex].name}
                      className="w-12 h-12 rounded-full border-3 border-green-100 object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold text-green-800 text-sm">{testimonials[nextIndex].name}</h4>
                    <p className="text-xs text-gray-600">{testimonials[nextIndex].role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-center mt-12 space-x-4">
          <button
            onClick={() => rotateCarousel('prev')}
            className="p-3 rounded-full bg-green-100 text-green-700 hover:bg-green-600 hover:text-white transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => rotateCarousel('next')}
            className="p-3 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};